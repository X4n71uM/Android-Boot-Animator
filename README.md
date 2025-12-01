# Xantium's Core Animator

**Xantium's Core Animator** is a specialized web-based tool designed to create flawless, uncompressed `bootanimation.zip` files for Android system branding. It combines technical precision with a zero-friction user experience, allowing developers, designers, and enthusiasts to convert various visual source media into compatible Android boot animations directly in the browser.

## 🚀 Features

-   **Versatile Media Support**: Accepts videos (`.mp4`, `.webm`, `.mov`), animated GIFs, or static image sequences (`.png`, `.jpg`).
-   **Dual Animation Modes**:
    -   **Standard**: A single looping sequence (perfect for simple animations).
    -   **Intro + Loop**: A "part0" intro that plays once, followed by a "part1" loop that repeats indefinitely.
-   **Client-Side Processing**: All rendering and compression happen locally in your browser. No files are uploaded to a server.
-   **Smart Formatting**: Automatically handles resizing and letterboxing (black bars) to fit your target resolution without stretching.
-   **Optimized Output**: Generates `bootanimation.zip` with **Store (No Compression)**, a strict requirement for Android boot animations to load correctly.
-   **Configurable Quality**: Adjust JPEG quality to balance visual fidelity and file size.
-   **Auto-Generated Config**: Automatically creates the correctly formatted `desc.txt` file based on your settings.

## 🛠️ Tech Stack

-   **Frontend Library**: React 19
-   **Styling**: Tailwind CSS
-   **Core Logic**:
    -   `JSZip`: For generating uncompressed zip files.
    -   `FileSaver.js`: For handling client-side downloads.
    -   **Canvas API & ImageBitmap**: For high-performance frame extraction and resizing.

## 📖 How to Use

1.  **Configuration**:
    -   Set your target **Width** and **Height** (e.g., 1080x1920).
    -   Set the desired **Framerate** (e.g., 30 fps).
    -   Adjust **Frame Quality** slider to manage file size (0.1 - 1.0).
    -   Select your **Mode** (Standard or Intro + Loop).

2.  **Upload Media**:
    -   Drag and drop your source file(s) into the designated dropzones.
    -   If using **Image Sequences**, ensure files are named sequentially (e.g., `frame001.png`, `frame002.png`).
    -   If using **Video/GIF**, the tool will automatically extract every frame based on the duration and your target FPS.

3.  **Generate**:
    -   Click **"Generate & Download bootanimation.zip"**.
    -   Wait for the processing bar to complete. The tool will parse frames, convert them to JPEG, generate the `desc.txt`, and zip the package.

## 🔧 Installation & Development

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/xantiums-core-animator.git
    cd xantiums-core-animator
    ```

2.  **Install Dependencies**
    *(Note: This project structure assumes a standard Node.js/Vite environment if ejected from the current standalone setup)*
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📝 Android Implementation Notes

The generated `bootanimation.zip` is ready to be pushed to an Android device.

1.  **Location**: Usually `/system/media/bootanimation.zip` or `/data/local/bootanimation.zip`.
2.  **Permissions**: Ensure the file permissions are set to `rw-r--r--` (644).
    ```bash
    adb push bootanimation.zip /system/media/
    adb shell chmod 644 /system/media/bootanimation.zip
    ```

## 📄 License

This project is open-source. Feel free to modify and distribute.