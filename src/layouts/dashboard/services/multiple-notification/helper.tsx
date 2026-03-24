import "@/components/index.css";

/**
 * A button that allows users to add a new section, up to a defined maximum.
 *
 * Automatically disables itself and updates its label when the `maxBlocks`
 * limit is reached, providing clear visual and textual feedback.
 *
 * @param onClick - Callback fired when the button is clicked (no-op when disabled).
 * @param data - The current list of sections; its length determines the usage count.
 * @param maxBlocks - The maximum number of sections permitted.
 * @param title - Display name for the section type (e.g. `"Recipient"`, `"Block"`).
 *
 * @example
 * // Renders: "Add Another Recipient Section (2/5)"
 * <AddButton
 *   onClick={handleAdd}
 *   data={recipients}
 *   maxBlocks={5}
 *   title="Recipient"
 * />
 *
 * @example
 * // Renders: "Max 5 Recipient sections reached" (disabled)
 * <AddButton
 *   onClick={handleAdd}
 *   data={new Array(5)}
 *   maxBlocks={5}
 *   title="Recipient"
 * />
 */
export const AddButton = ({
  onClick,
  data,
  maxBlocks,
  title,
}: {
  /** Callback fired when the button is clicked. */
  onClick: () => void;
  /** Current list of sections; used to derive the live count. */
  data: any[];
  /** Upper limit on the number of sections allowed. */
  maxBlocks: number;
  /** Human-readable label for the section type shown in the button text. */
  title: string;
}) => {
  /** `true` when the current section count has met or exceeded `maxBlocks`. */
  const limitExceed = data.length >= maxBlocks;

  return (
    <button
      onClick={onClick}
      disabled={limitExceed}
      className="add-btn"
      style={{
        fontSize: "12px",
        background: limitExceed ? "rgba(128, 128, 128, 0.2)" : "",
        border: limitExceed ? `1px solid ${"rgba(128, 128, 128, 0.4)"}` : "",
        color: limitExceed ? "#888" : "#fff",
        cursor: limitExceed ? "not-allowed" : "pointer",
        transition: "all 0.2s",
      }}
    >
      {limitExceed
        ? `Max ${maxBlocks} ${title} sections reached`
        : `Add Another ${title} Section (${data.length}/${maxBlocks})`}
    </button>
  );
};