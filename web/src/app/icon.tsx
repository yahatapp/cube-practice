import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#07111f",
        color: "#69e6c1",
        display: "flex",
        fontSize: 220,
        fontWeight: 800,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      X+
    </div>,
    size,
  );
}
