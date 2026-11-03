package com.examseatx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SpaForwardController
 *
 * Forwards frontend SPA routes to index.html so client-side routing
 * (React Router) works seamlessly on page refresh and direct URLs.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/dashboard",
        "/students",
        "/classrooms",
        "/exams",
        "/lookup",
        "/scanner",
        "/notice-board"
    })
    public String forwardFrontend() {
        return "forward:/index.html";
    }
}

