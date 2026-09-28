import silly from "./assets/silly.png?inline";

export function entryImage({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 32,
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "Inconsolata",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          border: "4px solid #ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            padding: "40px 48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                display: "flex",
                width: 28,
                height: 28,
                padding: 4,
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  padding: 4,
                  backgroundColor: "#000000",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#49d158",
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em" }}>
              Mackie Underdown · personal wiki
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              margin: "auto 0",
            }}
          >
            <h1
              style={{
                maxWidth: 660,
                margin: 0,
                fontSize: 78,
                fontWeight: 700,
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
              }}
            >
              {title}
            </h1>
            <div
              style={{
                width: 112,
                height: 8,
                marginTop: 28,
                backgroundColor: "#49d158",
              }}
            />
            <p
              style={{
                maxWidth: 620,
                margin: "24px 0 0",
                color: "#b8b8b8",
                fontSize: 25,
                lineHeight: 1.35,
              }}
            >
              {description}
            </p>
          </div>

          <span
            style={{
              color: "#b8b8b8",
              fontSize: 22,
              letterSpacing: "0.02em",
            }}
          >
            mackie.underdown.wiki
          </span>
        </div>

        <aside
          style={{
            display: "flex",
            width: 280,
            overflow: "hidden",
            borderLeft: "4px solid #ffffff",
            backgroundColor: "#000000",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
            src={silly}
            alt=""
          />
        </aside>
      </div>
    </div>
  );
}
