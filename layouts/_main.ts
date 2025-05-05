type PageContent = {
  TITLE: string;
  HEAD: string;
  BODY: string;
}

export function htmlDocument(content: PageContent) {
  const {
    TITLE = '',
    HEAD = '',
    BODY = ''
  } = content;

  return (`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${TITLE}</title>
  ${HEAD}
</head>
<body>
${BODY}
</body>
</html>`
  );
}
