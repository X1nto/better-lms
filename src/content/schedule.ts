const lessonTypes = ["ლექცია", "ჯგუფური", "პრაქტიკული", "ლაბორატორია"] as const;
type LessonType = typeof lessonTypes[number];

const weekdays = ["ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი"] as const;
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

    const oldSchedule = document.getElementById("schedule") as HTMLTableElement;
    const oldScheduleParent = oldSchedule.parentElement;
    createTable(oldSchedule, oldScheduleParent)
    createReferences(oldScheduleParent)

    connectObserver()
})
connectObserver()


function connectObserver() {
    observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
    })
}

function createReferences(parent: HTMLElement | null) {
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
    parent?.appendChild(div)
}

function createTable(oldSchedule: HTMLTableElement, oldScheduleParent: HTMLElement | null) {
    const weekdayLessons = parseTable(oldSchedule);

    document.getElementById('better-schedule')?.remove();

    const table = document.createElement('table');
    table.id = 'better-schedule';
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
        for (let j = 0; j < weekdays.length; j++) {
            tr.appendChild(document.createElement('td'));
        }

        tableBody.appendChild(tr);
    }

    for (let i = 0; i < weekdays.length; i++) {
        const weekday = weekdays[i];

        const header = document.createElement('th');
        header.innerText = weekday
        tableHeaderTr.appendChild(header);

        let lessons = weekdayLessons.get(weekday)
        if (lessons) {
            lessons.sort((a, b) => {
                if (a.startTime < b.startTime) {
                    return -1;
                } else if (a.startTime > b.startTime) {
                    return 1;
                } else {
                    return 0;
                }
            }).forEach((lesson, j) => {
                const target = tableBody.children[j].children[i] as HTMLElement;
                target.style.background = getColorForLessonType(lesson.type);
                target.innerHTML = makeLessonContent(lesson);
            })
        }
    }

    tableHeader.appendChild(tableHeaderTr);
    table.appendChild(tableHeader);
    table.appendChild(tableBody);
    oldScheduleParent?.appendChild(table);
    oldSchedule.style.display = 'none';
}

//gamoylevdeba kaci amas rom dainaxavs
function parseTable(oldSchedule: HTMLTableElement): Map<Weekday, Lesson[]> {
    const weekdayLessons: Map<Weekday, Lesson[]> = new Map();

    for (let lesson of oldSchedule.tBodies[0].rows) {
        const lessonName = lesson.children[0].innerHTML;
        for (let i = 0; i < lessonTypes.length; i++) {
            const lessonType = lessonTypes[i];
            const tsuLessonTypeEl = lesson.children[i + 1];
            const syllabus = lesson.children[5]
            if (!tsuLessonTypeEl.innerHTML) {
                continue;
            }
            const tsuLessonTypeData = tsuLessonTypeEl.innerHTML.split('<br>');

            const weekday = parseDataFromElement(tsuLessonTypeData[1]) as Weekday
            const lessonObject: Lesson = {
                type: lessonType,
                name: lessonName,
                lector: parseDataFromElement(tsuLessonTypeData[0]),
                startTime: parseDataFromElement(tsuLessonTypeData[2]),
                endTime: parseDataFromElement(tsuLessonTypeData[3]),
                auditory: parseDataFromElement(tsuLessonTypeData[4]),
                syllabusId: syllabus.id.split('_')[1]
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
        <a onclick="OpenSyllabusPanel(${lesson.syllabusId})">${lesson.name}</a>
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