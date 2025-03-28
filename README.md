# PDF Annotation Web App

A web application for viewing, annotating, and exporting PDF documents with various annotation tools.

## Features

- 📄 PDF viewing with page navigation
- ✏️ Annotation tools (highlight, underline, comment, freehand drawing)
- 💾 Export annotated PDFs
- 🎨 Customizable colors for annotations
- 📱 Responsive design

## Libraries and Tools Used

- React PDF (react-pdf): To render and display PDF files.

- React-dropzone: For drag and drop.

- Pdf-lib: For exporting  pdf file.

- Tailwind CSS: For styling and layout.

- Lucide React: Provides a clean icon set for UI elements.

- React Hooks: Used for managing component state and effects.

- React-toastify: For notification.

- TypeScript: To ensure type safety and catch errors  during development 

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

- Clone the repository:
 **Run** [**git clone** ```https://github.com/Yorsyboy/pdf-doc.git```]
- Install dependence:
 **Run** [```cd pdf-doc```]
 **Run** [```npm i or yarn add``]
- Start the development server:
 **Run** [```npm run dev or yarn dev`]
- Open your browser and navigate to:
  [``http://localhost:3000``]

  ### Challenges and Solutions

- PDF Coordinate System Differences:

    Challenge: Browser and PDF coordinate systems differ (Y-axis inverted)

    Solution: Implemented conversion functions to properly position annotations
- Annotation:

    Challenge: Maintaining annotations across page changes

    Solution: Created a state management system that tracks annotations per page

- Signature Export Issues:

    Challenge: Signatures weren't appearing in exported PDFs

    Solution: Fixed base64 image processing and proper coordinate transformation

### Features Enhancements ( if i had more time )

- User Authentication:

    - Save and load annotated documents per user
    - Cloud storage integration

- Undo/Redo Functionality

    - Enable users to revert annotation actions.