const lessonTypes = ["ლექცია", "ჯგუფური", "პრაქტიკული", "ლაბორატორია"] as const;
type LessonType = typeof lessonTypes[number];

const weekdays = ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"] as const;
type Weekday = typeof weekdays[number];

interface Lesson {
    type: LessonType,
    lector: string,
    name: string,
    startTime: string,
    endTime: string,
    auditory: string,
    syllabusId: string
}

const observer = new MutationObserver(() => {
    observer.disconnect();

    const oldSchedule = document.getElementsByTagName("table")[0];
    if (oldSchedule !== undefined) {
        const oldScheduleParent = oldSchedule.parentElement;
        const weekdayLessons = parseTable(oldSchedule);
        const betterSchedule = createTable(weekdayLessons)
        oldScheduleParent?.appendChild(betterSchedule);
        oldSchedule.style.display = 'none';

        const legend = createLegend()
        oldScheduleParent?.appendChild(legend)
    }

    connectObserver()
})
connectObserver()


function connectObserver() {
    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: false,
    })
}

function createLegend(): HTMLElement {
    document.getElementById('schedule-reference')?.remove();

    const div = document.createElement('div');
    div.id = 'schedule-reference'
    div.style.marginTop = '15px';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '5px';
    for (let lessonType of lessonTypes) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.alignItems = 'center';
        container.style.gap = '5px';
        const square = document.createElement('div');
        square.style.backgroundColor = getColorForLessonType(lessonType);
        square.style.width = '20px';
        square.style.height = '20px';
        const reference = document.createElement('p');
        reference.innerText = lessonType;
        reference.style.margin = '0';
        container.append(square);
        container.append(reference);
        div.appendChild(container);
    }
    return div
}

function createTable(weekdayLessons: Map<Weekday, Lesson[]>): HTMLTableElement {
    const usedWeekdays = (() => {
        //Only get the weekdays when the student has lectures
        const parsedWeekdays = Array.from(weekdayLessons.keys())
        return weekdays.filter(e => parsedWeekdays.includes(e))
    })();

    document.getElementById('better-schedule')?.remove();

    const table = document.createElement('table');
    table.id = 'better-schedule';
    table.className = "table table-sm table-bordered table-responsive table-responsive-sm table-sticky"
    const tableHeader = document.createElement('thead');
    const tableHeaderTr = document.createElement('tr')
    const tableBody = document.createElement('tbody');

    let largest = 0;
    for (const value of weekdayLessons.values()) {
        if (value.length > largest) {
            largest = value.length;
        }
    }

    for (let i = 0; i < largest; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < usedWeekdays.length; j++) {
            tr.appendChild(document.createElement('td'));
        }

        tableBody.appendChild(tr);
    }

    for (let i = 0; i < usedWeekdays.length; i++) {
        const weekday = usedWeekdays[i];

        const header = document.createElement('th');
        header.innerText = weekday
        tableHeaderTr.appendChild(header);

        let lessons = weekdayLessons.get(weekday)
        if (lessons) {
            lessons.sort((a, b) => {
                if (a.startTime < b.startTime) return -1;
                if (a.startTime > b.startTime) return 1;
                return 0;
            }).forEach((lesson, j) => {
                const target = tableBody.children[j].children[i] as HTMLElement;
                target.dataset.color = getColorForLessonType(lesson.type)
                target.innerHTML = makeLessonContent(lesson);
            })
        }
    }

    tableHeader.appendChild(tableHeaderTr);
    table.appendChild(tableHeader);
    table.appendChild(tableBody);
    return table
}

//gamoylevdeba kaci amas rom dainaxavs
function parseTable(oldSchedule: HTMLTableElement): Map<Weekday, Lesson[]> {
    const weekdayLessons: Map<Weekday, Lesson[]> = new Map();

    let lessonTypes: LessonType[] = [];
    const header = oldSchedule.tHead;
    if (header === null) return weekdayLessons

    for (let type of header.rows[0].children) {
        switch (type.innerHTML) {
            case "ლექცია":
                lessonTypes.push("ლექცია");
                break;
            case "სამუშაო ჯგუფი":
                lessonTypes.push("ჯგუფური");
                break;
            case "ლაბორატორიული":
                lessonTypes.push("ლაბორატორია");
                break;
            case "პრაქტიკული":
                lessonTypes.push("პრაქტიკული");
                break;
            default:
                break;
        }
    }

    for (let lesson of oldSchedule.tBodies[0].rows) {
        const lessonName = lesson.children[0].innerHTML;
        for (let i = 0; i < lessonTypes.length; i++) {
            const lessonType = lessonTypes[i];
            const tsuLessonTypeEl = lesson.children[i + 1];
            if (!tsuLessonTypeEl.innerHTML)
                continue;

            if (tsuLessonTypeEl.children.length == 0)
                continue

            const tsuLessonTypeData = Array.from(tsuLessonTypeEl.children[0].children)
                .map(e =>  (e as HTMLDivElement).innerText);

            const lector = parseDataFromElement(tsuLessonTypeData[0])
            const auditory = parseDataFromElement(tsuLessonTypeData[1])
            const dayAndtime = parseDataFromElement(tsuLessonTypeData[2])
            const [day, time] = dayAndtime.split(',');
            const [startTime, endTime] = time.split('-');
            const weekday = day as Weekday
            const lessonObject: Lesson = {
                type: lessonType,
                name: lessonName,
                lector: lector,
                auditory: auditory,
                startTime: startTime,
                endTime: endTime,
                syllabusId: ''
            }

            if (weekday) {
                const current = weekdayLessons.get(weekday);
                if (current) {
                    current.push(lessonObject)
                    weekdayLessons.set(weekday, current);
                } else {
                    weekdayLessons.set(weekday, Array.of(lessonObject))
                }
            }
        }
    }
    return weekdayLessons
}

function makeLessonContent(lesson: Lesson): string {
    return `
        <strong>${lesson.name}</strong>
        <br>
        ${lesson.lector}
        <br>
        ${lesson.startTime}-${lesson.endTime}
        <br>
        ${lesson.auditory}
    `;
}

function getColorForLessonType(lessonType: LessonType): string {
    switch (lessonType) {
        case "ლექცია":
            return "LightSkyBlue";
        case "ჯგუფური":
            return "LightGreen";
        case "ლაბორატორია":
            return "LemonChiffon";
        case "პრაქტიკული":
            return "Plum"
    }
}

function parseDataFromElement(el: string): string {
    return el.split(': ')[1];
}