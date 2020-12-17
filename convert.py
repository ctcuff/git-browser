import json

def convert_github_languages():
    with open('./languages.json', 'r') as f:
        all_langs = json.loads(f.read())
        parsed = {}

        for (key, val) in all_langs.items():
            lang = all_langs[key]

            if not lang.get('extensions'):
                print(f'No extensions for language: {key}')
                continue
            parsed[key] = {
                'extensions': lang['extensions']
            }

        with open('./languages-parsed.json', 'w') as f:
            f.write(json.dumps(parsed, indent=3))


def convert_monaco_languages():
    with open('./monaco-languages.json', 'r') as f:
        all_langs = json.loads(f.read())
        parsed = {}
        seen = set()
        seen_id = set()

        for lang_obj in all_langs:
            _id = lang_obj['id']

            if not lang_obj.get('extensions'):
                print(f'No extensions for language: {_id}')
                continue

            for ext in lang_obj['extensions']:
                if ext in seen:
                    print(f'Duplate extension: {ext}')
                    continue

                parsed[ext] = _id

                seen.add(ext)

    with open('./monaco-languages-parsed.json', 'w') as f:
        f.write(json.dumps(parsed, indent=3))


if __name__ == "__main__":
    convert_monaco_languages()
