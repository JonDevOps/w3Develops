
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link2 } from "lucide-react";
import Link from "next/link";

const learningResources = [
    {
        topic: "Git & GitHub",
        description: "Version control is an essential skill for modern development. Learn how to track changes and collaborate with others using Git and GitHub.",
        links: [
            { title: "Git Handbook", url: "https://git-scm.com/docs/gittutorial" },
            { title: "Introduction to GitHub", url: "https://docs.github.com/en/get-started/quickstart/hello-world" },
            { title: "Learn Git Branching (Interactive)", url: "https://learngitbranching.js.org/" },
            { title: "freeCodeCamp - Git and GitHub for Beginners", url: "https://www.freecodecamp.org/news/git-and-github-for-beginners/" }
        ]
    },
    {
        topic: "HTML",
        description: "HyperText Markup Language (HTML) is the standard language for creating web pages. It's the skeleton of every site.",
        links: [
            { title: "Getting started with the web (Prerequisite)", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started" },
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

export default function LearnPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-10">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Learn</CardTitle>
                    <CardDescription>
                        Curated resources to help you learn and master essential web development skills.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {learningResources.map((resource) => (
                            <AccordionItem value={resource.topic} key={resource.topic}>
                                <AccordionTrigger className="text-xl font-semibold">{resource.topic}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                  <p className="text-muted-foreground">{resource.description}</p>
                                  <ul className="space-y-3">
                                      {resource.links.map((link) => (
                                          <li key={link.url}>
                                              <Link href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                                                 <Link2 className="h-4 w-4 flex-shrink-0" />
                                                 <span className="font-medium underline-offset-4 hover:underline">{link.title}</span>
                                              </Link>
                                          </li>
                                      ))}
                                  </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
