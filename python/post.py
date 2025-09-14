import os

def create_article(title, content):
    file_name = f"{title.replace(' ', '_').lower()}.html"
    with open(file_name, 'w') as f:
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
    article_title = input("Enter article title: ")
    article_content = input("Enter article content: ")
    create_article(article_title, article_content)
    print(f"Article '{article_title}' created successfully!")
