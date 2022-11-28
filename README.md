# Listr

## To-do's
- block outline on the side
- render all blocks
- create the new blocks
- adding blocks
- file icon
- dragging files
- settings
- acccounts
- saving user's files
- icons
- logo/app icon
- finish all the blocks
- search
- home menu
- star
- share
- lock (locks all children too)
- collapse sidenav
- last edited
- new file
- delete file
- change file color

## Command Line
- [new-root] New Root File
- [new-child] New Child File
- [new-sibling] New Sibling File
- [open-settings] Open Settings
- [open-home] Open Home
- [open-account] Open Account
- [file-delete] Delete This File
- [file-lock] Lock This File
- [file-star] Star This File
- [file-share] Share This File
- [file-rename] Rename This File
- [file-icon] Change This File Icon
- [x] Go to Parent File`
- [(block name)] New Blocks

## Blocks
### Text
- Heading 1
- Heading 2
- Heading 3
- Text
- Code Block
- URL
- Link Another File
- Math Equation
### Inline
- Code
- Tag/Highlight
- Math Equation
- Timestamp
- Link Another File

### Lists
- Lettered List
- Bulleted List
- Numbered List
- Roman Numeral Numbered List
- Checklist

### Other
- Embed File (Video, Photo, Audio)
- Table
- Divider
- Raw HTML


## JSON File Structure
files.json:
```json
[
  { 
    "name": "file name",    file name                                   [string]
    "icon": "file",         file icon                                   [string]
    "creationdate": 1,      creation date & time (time since epoch)     [integer]
    "lastedited": 1,        last edited date & time (time since epoch)  [integer]
    "children": [],         child files                                 [array]
    "blocks": [             blocks (heading, text, etc.)                [array]
      {
        "type": "heading1",    block type                                   [string]
        "data": "Heading"      block data                                   [any]
      }
    ],                      
    "starred": false,       file starred state                          [boolean]
    "locked": false,        file locked state                           [boolean]
    "archived": false       file archived state                         [boolean]
  }
]
```
starred:
- file is highlighted in sidenav

locked:
- file & all it's children are password protected

archived:
- file is hidden somehow and only accessible through a thing in sidenav