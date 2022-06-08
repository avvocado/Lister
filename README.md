# Lister

## RELEASES

### BETA 2

- item features
  - audio file support
  - multiple media file support
- menu bar additions
  - refresh button
- settings
  - user is sent to the top when they click the settings button
  - always on top option
- prevented multiple instances
- list changes
  - button to create new list
  - button to delete list

### BETA 3

- bug fixes
  - fixed bug where hovering over status dot would push item title
- item changes
  - link field in items
  - completed items get sent to the bottom of the list

### BETA 4

- new item button in sublist title div
- both new item buttons send new item to the top
- opening another instances when current one is in the tray will show the original one
- contenteditable elements will only send their innertext to the json file if it's actually been changed/edited
- .exe has proper icon now

### BETA 5

- changes to item settings
  - duplicate item button
  - icons have color on hover
  - delete item button is sent to the right and has a slightly different styling than the others
- dynamic "hello" text at top of the app
  - good morning from 5am-noon
  - good afternoon from noon-5pm
  - good evening from 5pm-10pm
  - good night from 10pm-5am
- priority items
  - priority items get sent to the top
  - have a star icon for their status dot
- styling changes
  - app is darker
  - text is darker
  - all svgs have rounded corners
- code pushed to github
- reverted back to one button adding item at top and one at bottom of sublist
- button to close global settings inside of the div

### BETA 6

- minor tweaks
  - darkened new item to bottom button icon
  - shows full file path when hovering on media
  - changed "requestJSON" to "requestList"
  - moved files into "resources" and "src folder"
  - changed ipcRenderer system to reduce parameters
  - clicking enter inside of item title, sublist title, and list title will trigger blur
  - changed green palette
  - changed gray palette
  - new item at bottom button is smaller and circular
  - button to open resources folder in settings
  - added fade in animation when you change lists
- home page
  - added date
- ADDED: new list type: "TEXT"
  - can create CODE BLOCKS and TEXT BLOCKS inside of it and freely write in them
  - code blocks
    - Consolas font, x-overflow has a scroll bar instead of line wraps, button to copy text, lighter background
- menu bar changes
  - removed to top button
  - removed new list button
  - removed refresh button
  - added "select" element to chose which list type to add
- ADDED: side menu
  - button for toggling each list
  - button for home page and settings
  - program saves which list you're on during a generateList()
  - moved new item button to bottom of it
- option to switch between black and white and color tray icon
- removed open media folder button in item settings
- removed collapse buttons
- lists have creation date now
- removed reminders
- minimize to tray changed to just close the app, tray is still there
- icons in side menu to show user what list type it is
- hides the list type when it's locked
- added alerts with 3 states, error, success, and neutral with red, green, and gray backgrounds