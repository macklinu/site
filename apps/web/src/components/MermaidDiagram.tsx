import { useEffect, useId, useRef } from "react";
import mermaid from "mermaid";

interface Props {
  definition: string;
  label?: string;
}

const palettes = {
  light: {
    background: "#f8f9fa",
    primaryColor: "#e3e9ed",
    primaryTextColor: "#152331",
    secondaryTextColor: "#152331",
    tertiaryTextColor: "#152331",
    textColor: "#152331",
    nodeTextColor: "#152331",
    lineColor: "#607080",
    secondaryColor: "#d8efc9",
    tertiaryColor: "#d9e4ff",
    edgeLabelBackground: "#f8f9fa",
  },
  dark: {
    background: "#202730",
    primaryColor: "#2f3b48",
    primaryTextColor: "#e4e8eb",
    secondaryTextColor: "#e4e8eb",
    tertiaryTextColor: "#e4e8eb",
    textColor: "#e4e8eb",
    nodeTextColor: "#e4e8eb",
    lineColor: "#aebbc7",
    secondaryColor: "#355044",
    tertiaryColor: "#30445d",
    edgeLabelBackground: "#202730",
  },
};

export default function MermaidDiagram({ definition, label = "Diagram" }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const id = useId().replaceAll(":", "");

  useEffect(() => {
    let disposed = false;

    const render = async () => {
      const element = container.current;

      if (disposed || !element) {
        return;
      }

      const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          ...palettes[theme],
          darkMode: theme === "dark",
          fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
          fontSize: "18px",
        },
      });

      const { svg, bindFunctions } = await mermaid.render(`mermaid-${id}`, definition);

      if (disposed) {
        return;
      }

      element.innerHTML = svg;
      bindFunctions?.(element);
    };

    const observer = new MutationObserver(() => {
      void render();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    void render();

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [definition, id]);

  return (
    <div
      ref={container}
      role="img"
      aria-label={label}
      className="my-6 overflow-x-auto border border-site-line bg-site-surface p-4 [&_svg]:block [&_svg]:min-w-[36rem]"
    />
  );
}
