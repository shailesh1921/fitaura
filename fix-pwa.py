import os
import re

app_dir = 'public/app'
html_files = [f for f in os.listdir(app_dir) if f.endswith('.html')]

meta_tags = """  <meta name="theme-color" content="#FAF6F0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">"""

for file in html_files:
    filepath = os.path.join(app_dir, file)
    with open(filepath, 'r') as f:
        content = f.read()

    # Inject meta tags if not present
    if 'apple-mobile-web-app-capable' not in content:
        # Find </title> or </head>
        content = re.sub(r'(<title>.*?</title>)', r'\1\n' + meta_tags, content, count=1, flags=re.IGNORECASE|re.DOTALL)
        if '<title>' not in content:
            content = re.sub(r'(<head>)', r'\1\n' + meta_tags, content, count=1, flags=re.IGNORECASE)

    # Update input type="number" to include inputmode="numeric" pattern="[0-9]*"
    content = re.sub(r'<input([^>]*?)type="number"([^>]*?)>', r'<input\1type="number" inputmode="numeric" pattern="[0-9]*"\2>', content)

    with open(filepath, 'w') as f:
        f.write(content)

print(f"Updated {len(html_files)} HTML files for PWA.")
