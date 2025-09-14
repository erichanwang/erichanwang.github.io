import os

def create_article(title, content, in_files=True):
    file_name = f"{title.replace(' ', '_').lower()}.html"
    if in_files:
        if not os.path.exists('python/files'):
            os.makedirs('python/files')
        file_path = os.path.join('python/files', file_name)
    else:
        file_path = file_name

    with open(file_path, 'w') as f:
        f.write(f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="../styles/style.css">
</head>
<body>
    <div class="container">
        <h1>{title}</h1>
        <p>{content}</p>
    </div>
    <script src="../scripts/script.js"></script>
</body>
</html>
""")

if __name__ == "__main__":
    article_title = input("Enter file name: ")
    article_content = input("Enter file content: ")
    save_in_files = input("Save in python/files? (y/n): ").lower() == ('y' or '')
    create_article(article_title, article_content, save_in_files)
    print(f"Article '{article_title}' created successfully!")
