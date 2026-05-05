## 4. Navigation & UX

### 4.1 Typography, color
- background: #202020
- all text: #FFFFFF
- H1: Gatin Latin Semibold 48/50
- H2: Gatin Latin Semibold 36/40
- H3: Myriad Pro Semibold 48/52
- p, li: Myriad Pro Regular 36/44

### 4.2 Attract Page
- Display all 14 map sets sequentially
- Background:
  - full screen
  - show each image for 4 seconds
  - cross-dissolve between images
- Title:
  - Center in viewport
  - H1: Gatin Latin Semibold 128/128
  - H2: Gatin Latin Semibold 64/64
- Prompt/Tap to Begin:
  - color block background: #015F82
  - color block on hover: #17BCF9
  - text align: center
  - H3: Gatin Latin Semibold 64/64, all caps

### 4.3 Main Menu
- Displays and provides links to all 14 map sets
- Layout:
  - Header - main nav:
    - height: 90px, width 560px
    - position: top left corner of page
    - background color #015F82
    - hamburger dropdown menu with links to each map set
    - site title: H1: Gatin Latin Semibold 48/50, title links back to Main Menu
  - Page Content:
    - A row of list items, overflow scrolls horizontally
    - Selecting an item navigates to its map page
  - Each item shows:
    - map set image: width 20vw, height 100% of containing row
    - map date: position top
    - Map title
    - map blurb

### 4.4 Map Page
- Layout:
  - Overall Layout: Header at top, page content comprised of two primary areas: main image with thumbnail nav and text content
  - Header - main nav:
    - height: 90px, width 560px
    - position: top left corner of page
    - background color #015F82
    - hamburger dropdown menu with links to each map set
    - site title: H1: Gatin Latin Semibold 48/50, title links back to Main Menu
  - Header - map nav:
    - height: 90px, width 720px
    - position: top right corner of page
    - background color #EC8923
    - content:
      - link to previous map set on left, link text "previous [map date]"
      - date of current map in center, link text "[map date]"
      - link to next map on right, link text "next [map date]"
  - Page Content:
    - Main Image:
      - OpenSeadragon viewer
      - thumbnail links for available map views, thumbnail links are 90px squares
    - Text Content:
      - Descriptive text area below main image in portrait orientation, to the right of main image in landscape orientation
      - Text includes: map set date, map set title, tombstone text, view title, view description
    - Image Behavior:
      - Clicking a thumbnail:
        - Loads the corresponding tile source into OpenSeadragon
        - Highlights the selected thumbnail
        - Updates the view descriptive text
- No overlays, markers, SVGs, or geospatial features; images only

## 4.4.1 Responsive Behavior of Map Page

- Portrait orientation: one column — text area below image area
  - vertical maps in portrait viewport: max height of 70vh and width of auto
  - horizontal maps in portrait viewport: max width of 90vw and height of auto
- Landscape orientation: two columns — text area to the right of image area
  - columns: left column 2/3 viewport, right column 1/3 viewport
  - vertical maps in landscape viewport: max height of 90vh and width of auto; center map in column and move thumbnails to immediate right of map, stacked vertically
  - horizontal maps in landscape viewport: max width of 100% of column and max-height of 90vh
- Definition:
  - Whether a given map is vertical or horizontal will be defined in the Django CMS, per map set
  - Within a given map set the image area proportion will remain constant for all map views
- Portrait mode — two cases:
  - vertical map: max view height for the image area so that text below is visible; width of image area will be less than viewport width; left justify the image area
  - horizontal map: full width; there will be room for text below
- Landscape mode (as determined by a media query):
  - vertical map: image area will be full height with thumbnails to the right
  - horizontal map: image fills the left column; thumbnails below map; text area in right column
- In all cases, on load, the initial default image will occupy the full width of the image area
- Phases:
  - Initially the proportion and max variables will be local; after testing we will move these variables to the API
  - During development the image area div should have a background color (beige) for troubleshooting
