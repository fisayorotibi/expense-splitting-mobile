# SVG Assets Directory

This directory is for storing SVG assets used in the application.

## Equalize Logo SVG

To replace the "Equalize" title text with your SVG logo:

1. Edit the `EqualizeLogoSvg.tsx` file
2. Replace the placeholder SVG code in the `defaultSvgXml` variable with your actual SVG code
3. Make sure your SVG uses `currentColor` for any parts you want to have dynamic color

### Example:

```tsx
const defaultSvgXml = `
<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Your actual SVG content here -->
  <path d="M10 20h100" stroke="currentColor" stroke-width="2"/>
  <!-- More SVG elements... -->
</svg>
`;
```

The `currentColor` in your SVG will be replaced with the color prop value passed to the component.

## Usage

The SVG is already implemented in the HomeScreen component:

```tsx
<ScreenHeader
  title=""
  headerSize="medium"
  rightAction={{
    icon: 'notifications-outline',
    onPress: handleNotificationsPress
  }}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  logoComponent={<EqualizeLogoSvg width={120} height={40} color={colors.text.primary} />}
>
```

You can adjust the width, height, and color props as needed. 