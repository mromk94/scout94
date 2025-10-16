// Prevents additional console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use std::process::{Command, Child};
use std::sync::Mutex;

// Store WebSocket server process
static WS_SERVER: Mutex<Option<Child>> = Mutex::new(None);

fn main() {
    // Start WebSocket server automatically
    start_websocket_server();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::run_scout94_test,
            commands::select_project_folder,
            commands::read_screenshot,
            commands::list_screenshots,
            commands::read_file_content,
            commands::write_file_content,
            commands::execute_command,
            commands::list_directory,
        ])
        .setup(|_app| {
            println!("✅ Scout94 Mission Control started!");
            Ok(())
        })
        .on_window_event(|_window, event| match event {
            tauri::WindowEvent::CloseRequested { .. } | tauri::WindowEvent::Destroyed => {
                // Stop WebSocket server when closing
                stop_websocket_server();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn start_websocket_server() {
    let ws_path = std::env::current_dir()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .map(|p| p.join("websocket-server"));

    if let Some(path) = ws_path {
        if path.exists() {
            println!("🚀 Starting WebSocket server...");
            match Command::new("npm")
                .arg("start")
                .current_dir(&path)
                .spawn()
            {
                Ok(child) => {
                    println!("✅ WebSocket server started (PID: {})", child.id());
                    if let Ok(mut server) = WS_SERVER.lock() {
                        *server = Some(child);
                    }
                }
                Err(e) => {
                    println!("❌ Failed to start WebSocket server: {}", e);
                }
            }
        } else {
            println!("⚠️ WebSocket server path not found: {:?}", path);
        }
    }
}

fn stop_websocket_server() {
    if let Ok(mut server) = WS_SERVER.lock() {
        if let Some(mut child) = server.take() {
            println!("🛑 Stopping WebSocket server...");
            let _ = child.kill();
            println!("✅ WebSocket server stopped");
        }
    }
}

