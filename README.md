# Laboratory Website

A lightweight static site for SAIL. Just edit a JSON file—no coding required.

## Project Structure

```
lab-website/
├── index.html                 # Main HTML file
├── css/
│   └── style.css             # All styling
├── js/
│   └── app.js                # Application logic
├── data/
│   └── config.json           # Site configuration (EDIT THIS!)
├── images/                   # Place your images here
└── README.md                 # This file
```

## Getting Started

### Edit Content (JSON only)

Open `data/config.json`—this file controls everything:
- Site title, description, navigation
- Banner slides, sections, news items
- Contact details, team info

### Add Images

Drop images in the `images/` folder and update the paths in `config.json`. For example:
```json
"logoUrl": "./images/logo.png",
"imageUrl": "./images/banner.jpg"
```

### Customize Colors

Edit `css/style.css` and update the color variables at the top:
```css
--primary-color: #00A2AC;
--secondary-color: #2C3E50;
--background-color: #FFFFFF;
```

Fonts, spacing, and layout settings are in the same file.

### Add New Sections

Since the site is modular, adding a section takes three steps:

1. Add a `<section>` in `index.html` with an ID and placeholder div:
   ```html
   <section id="my-section" class="section">
       <div class="container">
           <div id="my-section-content"></div>
       </div>
   </section>
   ```

2. Add your data to `config.json`:
   ```json
   "mySection": { "title": "...", "items": [...] }
   ```

3. Create a render function in `app.js` and call it from `initializeApp()`

## Configuration Reference

### Main Config Structure

```json
{
  "siteMeta": { ... },           // Page title & description
  "navigation": [ ... ],          // Top navigation links
  "header": { ... },              // Logo configuration
  "banner": { ... },              // Carousel slides
  "about": { ... },               // About section
  "specializations": { ... },     // Areas of expertise
  "research": { ... },            // Research topics
  "publications": { ... },        // Publications settings
  "news": { ... },                // News items
  "team": { ... },                // Team section
  "contact": { ... }              // Contact information
}
```

### Example: Adding a News Item

```json
"news": {
  "heading": "News & Updates",
  "items": [
    {
      "id": "news-1",
      "title": "New Research Project Launched",
      "date": "2024-03-15",
      "excerpt": "We are excited to announce...",
      "link": "#news-detail-1"
    }
  ]
}
```

## Local Development

1. Open `index.html` in a web browser (no server required)
2. Edit files with any text editor
3. Refresh the browser to see changes

For development with auto-reload, use VS Code's Live Server extension:
- Install: "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

## Deployment

The site is ready to deploy to any static hosting:

- **GitHub Pages**: Push to a GitHub repository
- **Netlify**: Connect your repository or drag-and-drop the folder
- **Vercel**: Similar to Netlify
- **Traditional hosting**: Upload files via FTP

## Customization Checklist

- [ ] Update `config.json` with your lab/organization info
- [ ] Add images to `images/` folder
- [ ] Update image paths in `config.json`
- [ ] Customize colors in `css/style.css`
- [ ] Add staff/team information
- [ ] Set up contact form submission (requires backend)
- [ ] Update social media links
- [ ] Test on mobile devices

## Common Customizations

### Adjust Carousel Transition Speed

Edit in `app.js`:
```javascript
setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}, 5000);  // Change 5000 (milliseconds) to desired value
```

### Modify Grid Layouts

Edit in `css/style.css` - look for `grid-template-columns` in each section

### Add New Navigation Item

Edit `config.json`:
```json
"navigation": [
    { "label": "New Page", "href": "#new-page" },
    ...
]
```

## Troubleshooting

**Images not loading?**
- Check that image files are in the `images/` folder
- Verify paths in `config.json` use relative paths: `./images/filename.jpg`

**Carousel not working?**
- Ensure `app.js` is loaded before carousel (check browser console)
- Check that image paths are correct

**Styling issues?**
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Check for CSS conflicts in browser Developer Tools

## Support & Maintenance

This site is designed to be maintained by anyone with basic HTML knowledge. For questions:

1. Check the "How to Use" section above
2. Review `config.json` comments
3. Inspect HTML/CSS/JavaScript files with comments explaining key sections
