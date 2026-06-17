# Laboratory Website

A lightweight static site for SAIL. Just edit a JSON file—no coding required.

## Project Structure

```
lab-website/
├── index.html                 # Home page
├── team.html                  # Team member profiles
├── contributions.html         # Contributions & impact
├── honors-awards.html         # Honors & awards
├── publications.html          # Publications archive
├── css/
│   └── styles.css            # All styling
├── js/
│   └── script.js             # Application logic
├── data/
│   └── data.json             # Site configuration (EDIT THIS!)
├── images/                   # Place your images here
└── README.md                 # This file
```

## Getting Started

### Edit Content (JSON only)

Open `data/data.json`—this file controls everything:
- Site title, description, and navigation tabs
- Home page sections (about, research areas, research_area)
- Team member profiles and groupings
- Publications, honors, and awards data
- Contact information

No need to edit HTML files unless you want to customize the layout.

### Add Images

Drop images in the `images/` folder and update the paths in `data.json`. For example:
```json
"logoUrl": "./images/logo.png",
"imageUrl": "./images/banner.jpg"
```

### Customize Colors

Edit `css/styles.css` and update the color variables at the top:
```css
--primary-color: #00A2AC;
--secondary-color: #2C3E50;
--background-color: #FFFFFF;
```

Fonts, spacing, and layout settings are in the same file.

### Add Content by Pages

The site is organized as separate HTML pages, each controlled by data in `data.json`:

- **Home page** (`index.html`): About, research areas, services
- **Team page** (`team.html`): Organized by groups (Coordination, Post-docs, PhD, MSc, Undergraduate, etc.)
- **Contributions** (`contributions.html`): Impact and contributions data
- **Honors & Awards** (`honors-awards.html`): Recognition and awards
- **Publications** (`publications.html`): Publication listings

## Configuration Reference

### Main Config Structure

```json
{
  "site": { ... },                // Site title & description
  "header": { ... },              // Logo and header configuration
  "navigation": [ ... ],          // Top navigation tabs
  "heroSlides": [ ... ],          // Home page banner carousel
  "about": { ... },               // About section
  "research_area": { ... },     // Research areas with tabs
  "services": { ... },            // Services section
  "teamPage": { ... },            // Team member profiles and groups
  "contributionsPage": { ... },   // Contributions & impact
  "honorsPage": { ... },          // Honors & awards
  "publicationsPage": { ... },    // Publications data
  "contact": { ... }              // Contact information
}
```

## Local Development

1. Open any `.html` file in a web browser (e.g., `index.html`)
2. Edit `data.json` with any text editor
3. Refresh the browser to see changes

For development with auto-reload, use VS Code's Live Server extension:
- Install: "Live Server" extension in VS Code
- Right-click any HTML file → "Open with Live Server"

## Deployment

The site is ready to deploy to any static hosting:

- **GitHub Pages**: Push to a GitHub repository
- **Netlify**: Connect your repository or drag-and-drop the folder
- **Vercel**: Similar to Netlify
- **Traditional hosting**: Upload files via FTP

## Customization Checklist

- [ ] Update `data.json` with your lab/organization info
- [ ] Add images to `images/` folder and update paths in `data.json`
- [ ] Customize colors in `css/styles.css`
- [ ] Add team members to `teamPage` section
- [ ] Add honors & awards to `honorsPage` section
- [ ] Add contributions data to `contributionsPage` section
- [ ] Update social media links
- [ ] Test all pages on mobile devices

## Common Customizations

### Modify Grid Layouts

Edit in `css/styles.css` - look for `grid-template-columns` in each section class

### Add New Navigation Tab

Edit `data.json` in the `navigation` array to add a new tab and ensure the corresponding HTML file exists.

### Adjust Banner Carousel Transition Speed

Edit in `js/script.js` - look for the carousel interval setting and adjust the milliseconds value.

## Troubleshooting

**Images not loading?**
- Check that image files are in the `images/` folder
- Verify paths in `data.json` use relative paths: `./images/filename.jpg`

**Navigation not working?**
- Ensure all referenced HTML files exist (team.html, contributions.html, etc.)
- Check that URLs in `data.json` navigation match your file names

**Page content not showing?**
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Open browser Developer Tools (F12) and check console for errors
- Verify JSON syntax in `data.json` is valid

## Support & Maintenance

This site is designed to be maintained by anyone with basic knowledge. For editing content:

1. Check the "Configuration Reference" section above
2. Edit `data.json` with any text editor to update content
3. Keep `data.json` syntax valid (use a JSON validator if unsure)
4. Test changes in the browser before deploying
