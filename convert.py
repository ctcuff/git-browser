import json


def convert_monaco_languages():
    parsed = {}
    seen = set()

    with open('./src/assets/monaco-languages.json', 'r') as f:
        all_langs = json.loads(f.read())

        for lang in all_langs:
            _id = lang['id']

            if not lang.get('extensions'):
                print(f'Warning: {_id} missing "extensions" key')
                continue

            if len(lang['extensions']) == 0:
                print(f'Warning: {_id} has no extensions, skipping')
                continue

            for ext in lang['extensions']:
                if ext in seen:
                    print(f'Warning: duplicate extension: {ext}, skipping...')
                    continue

                parsed[ext] = {
                    'language': _id,
                    'displayName': lang['aliases'][0],
                    'canEditorRender': True,
                    'extension': ext
                }

            # Use file names as extensions. These will allow us to detect
            # files like Dockerfiles and config files and add syntax highlighting
            if lang.get('filenames'):
                for filename in lang['filenames']:
                    if filename in seen:
                        print(f'Warning: duplicate extension: {filename}, skipping...')
                        continue

                    parsed[filename] = {
                        'language': _id,
                        'displayName': lang['aliases'][0],
                        'canEditorRender': True,
                        'extension': ext
                    }



    with open('./monaco-languages-parsed.json', 'w') as f:
        f.write(json.dumps(parsed, indent=3))

if __name__ == "__main__":
    convert_monaco_languages()
