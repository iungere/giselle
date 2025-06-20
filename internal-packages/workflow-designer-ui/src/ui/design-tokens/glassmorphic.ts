export const glassmorphicTokens = {
  colors: {
    glass: {
      background: "linear-gradient(135deg, rgba(150, 150, 150, 0.03) 0%, rgba(60, 90, 160, 0.12) 100%)",
      border: "rgba(255, 255, 255, 0.1)",
      topHighlight: "rgba(255, 255, 255, 0.4)",
    },
    button: {
      glass: {
        background: "linear-gradient(180deg, #202530 0%, #12151f 100%)",
        border: "rgba(0, 0, 0, 0.7)",
        text: "rgba(255, 255, 255, 0.8)",
      },
    },
  },
  effects: {
    blur: {
      medium: "backdrop-blur-md",
      light: "backdrop-blur-sm",
    },
    shadow: {
      glassmorphic: "0 2px 8px rgba(5, 10, 20, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
      button: "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 2px 8px rgba(5, 10, 20, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
      elevated: "shadow-xl",
    },
  },
  borders: {
    radius: {
      modal: "12px",
      button: "8px",
    },
  },
  transitions: {
    default: "transition-all duration-200",
    button: "active:scale-[0.98]",
  },
} as const;

export type GlassmorphicTokens = typeof glassmorphicTokens;

// Utility functions for easier usage
export const getGlassStyles = () => ({
  background: glassmorphicTokens.colors.glass.background,
  backdropFilter: glassmorphicTokens.effects.blur.medium,
  border: `1px solid ${glassmorphicTokens.colors.glass.border}`,
  borderRadius: glassmorphicTokens.borders.radius.modal,
  boxShadow: glassmorphicTokens.effects.shadow.elevated,
});

export const getGlassButtonStyles = () => ({
  background: glassmorphicTokens.colors.button.glass.background,
  border: `1px solid ${glassmorphicTokens.colors.button.glass.border}`,
  borderRadius: glassmorphicTokens.borders.radius.button,
  boxShadow: glassmorphicTokens.effects.shadow.button,
  color: glassmorphicTokens.colors.button.glass.text,
});

export const getTopHighlightStyles = () => ({
  background: `linear-gradient(to right, transparent, ${glassmorphicTokens.colors.glass.topHighlight}, transparent)`,
  height: "1px",
});
