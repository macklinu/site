import type { EntryKind } from "~/lib/Entry";

const labels: Record<EntryKind, string> = {
  article: "POST",
  note: "NOTE",
  demo: "DEMO",
  guide: "GUIDE",
};

const labelColors: Record<EntryKind, { backgroundColor: string; color: string }> = {
  article: { backgroundColor: "#266bb0", color: "#f4f8fa" },
  note: { backgroundColor: "#49d158", color: "#1b293b" },
  demo: { backgroundColor: "#c13c37", color: "#f4f8fa" },
  guide: { backgroundColor: "#1b293b", color: "#f4f8fa" },
};

export function entryImage(entry: { title: string; description: string; kind: EntryKind }) {
  const labelColor = labelColors[entry.kind];

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 36,
        backgroundColor: "#f4f8fa",
        color: "#1b293b",
        fontFamily: "Inconsolata",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          border: "6px solid #1b293b",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "38px 44px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "5px solid #1b293b",
                backgroundColor: "#49d158",
              }}
            />
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em" }}>Mackie</span>
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 74,
              padding: "7px 10px",
              ...labelColor,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {labels[entry.kind]}
          </div>
          <h1
            style={{
              margin: "24px 0 0",
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
            }}
          >
            {entry.title}
          </h1>
          <p
            style={{
              margin: "24px 0 0",
              maxWidth: 620,
              color: "#526377",
              fontSize: 25,
              lineHeight: 1.35,
            }}
          >
            {entry.description}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: "auto",
              color: "#526377",
              fontSize: 22,
              letterSpacing: "0.02em",
            }}
          >
            <div style={{ width: 72, height: 5, backgroundColor: "#266bb0" }} />
            <span>mackie.underdown.wiki</span>
          </div>
        </div>

        <aside
          style={{
            display: "flex",
            width: 266,
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
            borderLeft: "6px solid #1b293b",
            backgroundColor: "#dce8ef",
          }}
        >
          <img
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            src={new URL(`/silly-grayscale.png`, import.meta.env.SITE).toString()}
            alt=""
          />
        </aside>
      </div>
    </div>
  );
}
