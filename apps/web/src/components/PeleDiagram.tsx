import { useEffect, useRef } from "react";
import { mount, register } from "pele/core";
import flowchart from "pele/diagrams/flowchart";

interface Props {
  definition: string;
  label?: string;
}

register(flowchart);

export default function PeleDiagram({ definition, label = "Diagram" }: Props) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }

    const diagram = mount(container.current, definition, {
      fontSize: 18,
      // Keep labels readable when a layout still needs horizontal scrolling.
      responsive: false,
      zoom: false,
    });

    return () => diagram.destroy();
  }, [definition]);

  // The SVG is one labelled graphic. Keyboard users can focus its scroll container.
  /* oxlint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-tabindex */
  return (
    <div
      ref={container}
      role="img"
      aria-label={label}
      tabIndex={0}
      className="my-6 overflow-x-auto border border-site-line bg-site-surface p-4 font-mono catalogue:w-[min(64rem,calc(100vw_-_3rem))] [&_svg]:block"
    />
  );
  /* oxlint-enable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-tabindex */
}
