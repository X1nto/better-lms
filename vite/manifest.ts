import {copyFileSync} from 'fs';
import {resolve} from 'path';
import {PluginOption} from 'vite';

export default function manifest(browser: string): PluginOption {
    return {
        name: 'manifest',
        writeBundle(options) {
            const manifestPath = resolve(
                __dirname,
                '..',
                'manifest',
                `${browser}.json`
            );
            const outManifestPath = resolve(options.dir!, 'manifest.json');
            copyFileSync(manifestPath, outManifestPath);
        },
    };
}