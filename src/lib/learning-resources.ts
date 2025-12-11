
interface LearningLink {
    title: string;
    url: string;
}

interface LearningResource {
    topic: string;
    description: string;
    links: LearningLink[];
}

export const webLearningResources: LearningResource[] = [
    {
        topic: "Getting Started",
        description: "A prerequisite guide to understanding the basics of web development before diving into specific technologies.",
        links: [
            { title: "Getting started with the web", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started" },
        ]
    },
    {
        topic: "Git",
        description: "Git is the most widely used modern version control system in the world. It’s a distributed SCM (source code management) tool, meaning the entire codebase and history is available on every developer’s computer.",
        links: [
            { title: "Basic Git Commands", url: "https://confluence.atlassian.com/bitbucketserver/basic-git-commands-776639767.html" },
            { title: "Atlassian Git Cheatsheet [PDF Download]", url: "https://www.atlassian.com/dam/jcr:8132028b-024f-4b6b-953e-e68fcce0c5fa/atlassian-git-cheatsheet.pdf" },
        ]
    },
     {
        topic: "GitHub",
        description: "GitHub is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.",
        links: [
            { title: "Interactive Courses", url: "https://learn.github.com/skills" },
            { title: "GitHub Get Started Docs", url: "https://docs.github.com/en/get-started" },
        ]
    },
    {
        topic: "HTML",
        description: "HyperText Markup Language (HTML) is the standard language for creating web pages. It's the skeleton of every site.",
        links: [
            { title: "freeCodeCamp - Responsive Web Design", url: "https://www.freecodecamp.org/learn/responsive-web-design-v9/" },
            { title: "MDN - Structuring the web with HTML", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content" },
            { title: "web.dev - Learn HTML", url: "https://web.dev/learn/html" },
            { title: "W3Schools - HTML Tutorial", url: "https://www.w3schools.com/html/default.asp" }
        ]
    },
    {
        topic: "CSS",
        description: "Cascading Style Sheets (CSS) is used to style and lay out web pages — for example, to alter the font, color, size, and spacing of your content.",
        links: [
            { title: "freeCodeCamp - Responsive Web Design", url: "https://www.freecodecamp.org/learn/responsive-web-design-v9/" },
            { title: "MDN - CSS first steps", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics" },
            { title: "web.dev - Learn CSS", url: "https://web.dev/learn/css" },
            { title: "W3Schools - CSS Tutorial", url: "https://www.w3schools.com/css/default.asp" }
        ]
    },
    {
        topic: "JavaScript",
        description: "JavaScript is a programming language that enables you to create dynamically updating content, control multimedia, animate images, and much more.",
        links: [
            { title: "freeCodeCamp - JavaScript Algorithms and Data Structures", url: "https://www.freecodecamp.org/learn/javascript-v9/" },
            { title: "MDN - What is JavaScript?", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript" },
            { title: "web.dev - Learn JavaScript", url: "https://web.dev/learn/javascript" },
            { title: "W3Schools - JavaScript Tutorial", url: "https://www.w3schools.com/js/default.asp" }
        ]
    }
];

export const cybersecurityResources: LearningResource[] = [
    {
        topic: "Cybersecurity",
        description: "Cybersecurity involves protecting systems, networks, and programs from digital attacks. These attacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes.",
        links: []
    }
];
