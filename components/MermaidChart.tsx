"use client";

import React, { useEffect } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
    themeVariables: {
        fontFamily: "monospace",
        primaryColor: "#39FF14",
        primaryTextColor: "#000",
        secondaryColor: "#00FFFF",
        lineColor: "#39FF14",
    },
});

export default function MermaidChart({ chart }: { chart: string }) {
    useEffect(() => {
        mermaid.contentLoaded();
    }, [chart]);

    const cleanChart = chart.replace(/```mermaid/g, "").replace(/```/g, "").trim();

    return <div className="mermaid">{cleanChart}</div>;
}
