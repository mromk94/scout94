// Prevents additional console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod remote_scanner;

use std::process::{Command, Child};
use std::sync::Mutex;
use std::fs;
use std::path::PathBuf;
use std::io::Write;

// Store WebSocket server process
static WS_SERVER: Mutex<Option<Child>> = Mutex::new(None);

fn main() {
    // Check for existing instance and create PID file
    let pid_file = get_pid_file_path();
    if check_existing_instance(&pid_file) {
        eprintln!("⚠️ Another Scout94 instance is already running. Exiting...");
        std::process::exit(1);
    }
    
    // Create PID file with current process ID
    write_pid_file(&pid_file);
    
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
            commands::read_directory_tree,
            remote_scanner::deploy_scanner_remote,
            remote_scanner::run_scout94_remote,
            remote_scanner::check_remote_access
        ])
        .setup(|_app| {
            println!("✅ Scout94 Mission Control started!");
            println!("📌 PID file: {:?}", get_pid_file_path());
            Ok(())
        })
        .on_window_event(|_window, event| match event {
            tauri::WindowEvent::CloseRequested { .. } | tauri::WindowEvent::Destroyed => {
                println!("🛑 Window close requested - initiating graceful shutdown...");
                // Stop WebSocket server when closing
                stop_websocket_server();
                // Clean up PID file
                cleanup_pid_file();
                // Kill any orphaned processes
                kill_orphaned_processes();
                println!("✅ Graceful shutdown complete");
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    // Ensure cleanup on exit
    cleanup_on_exit();
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
            let pid = child.id();
            
            // Try graceful shutdown first
            #[cfg(unix)]
            {
                // Send SIGTERM for graceful shutdown
                let _ = Command::new("kill")
                    .arg("-15")
                    .arg(pid.to_string())
                    .output();
                
                // Wait a moment for graceful shutdown
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
            
            // Force kill if still running
            let _ = child.kill();
            let _ = child.wait(); // Wait for process to actually exit
            
            println!("✅ WebSocket server stopped (PID: {})", pid);
        }
    }
}

fn get_pid_file_path() -> PathBuf {
    std::env::temp_dir().join("scout94.pid")
}

fn check_existing_instance(pid_file: &PathBuf) -> bool {
    if !pid_file.exists() {
        return false;
    }
    
    // Read PID from file
    if let Ok(content) = fs::read_to_string(pid_file) {
        if let Ok(pid) = content.trim().parse::<u32>() {
            // Check if process is actually running
            #[cfg(unix)]
            {
                let output = Command::new("kill")
                    .arg("-0")
                    .arg(pid.to_string())
                    .output();
                
                if let Ok(result) = output {
                    if result.status.success() {
                        return true; // Process exists
                    }
                }
            }
            
            #[cfg(windows)]
            {
                let output = Command::new("tasklist")
                    .arg("/FI")
                    .arg(format!("PID eq {}", pid))
                    .output();
                
                if let Ok(result) = output {
                    let stdout = String::from_utf8_lossy(&result.stdout);
                    if stdout.contains(&pid.to_string()) {
                        return true; // Process exists
                    }
                }
            }
        }
    }
    
    // Stale PID file - remove it
    let _ = fs::remove_file(pid_file);
    false
}

fn write_pid_file(pid_file: &PathBuf) {
    let pid = std::process::id();
    if let Ok(mut file) = fs::File::create(pid_file) {
        let _ = write!(file, "{}", pid);
        println!("📝 Created PID file with PID: {}", pid);
    }
}

fn cleanup_pid_file() {
    let pid_file = get_pid_file_path();
    if pid_file.exists() {
        let _ = fs::remove_file(&pid_file);
        println!("🗑️  Removed PID file");
    }
}

fn kill_orphaned_processes() {
    // Kill any orphaned node processes related to Scout94
    #[cfg(unix)]
    {
        println!("🔍 Checking for orphaned processes...");
        
        // Kill WebSocket server processes
        let _ = Command::new("pkill")
            .arg("-f")
            .arg("websocket-server")
            .output();
        
        // Kill any Scout94-related node processes
        let _ = Command::new("pkill")
            .arg("-f")
            .arg("scout94.*node")
            .output();
        
        println!("✅ Orphaned processes cleaned up");
    }
}

fn cleanup_on_exit() {
    cleanup_pid_file();
    println!("👋 Scout94 exited cleanly");
}
