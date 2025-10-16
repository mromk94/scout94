use std::process::Command;
use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TestResult {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn run_scout94_test(project_path: String, test_type: String) -> Result<TestResult, String> {
    println!("🚀 Running REAL Scout94 test: {} on {}", test_type, project_path);
    
    // Use the actual test runner in the Viz Venture Group project
    let test_runner_path = format!("{}/tests/scout94_test_runner.php", project_path);
    
    // Verify the test runner exists
    if !Path::new(&test_runner_path).exists() {
        return Err(format!("Test runner not found at: {}", test_runner_path));
    }
    
    // Map test types to appropriate test names
    let test_name = match test_type.as_str() {
        "routing" => "auth",
        "visitor" | "user" => "investment",
        "audit" => "security",
        "database" => "database",
        _ => "all",
    };
    
    println!("📋 Executing: php {} {}", test_runner_path, test_name);
    
    let output = Command::new("php")
        .arg(&test_runner_path)
        .arg(test_name)
        .current_dir(&project_path)
        .output();
    
    match output {
        Ok(result) => {
            let stdout = String::from_utf8_lossy(&result.stdout).to_string();
            let stderr = String::from_utf8_lossy(&result.stderr).to_string();
            
            println!("✅ Test completed");
            println!("Output length: {} bytes", stdout.len());
            
            Ok(TestResult {
                success: result.status.success(),
                output: stdout,
                error: if stderr.is_empty() { None } else { Some(stderr) },
            })
        }
        Err(e) => {
            println!("❌ Test execution failed: {}", e);
            Err(format!("Failed to execute test: {}", e))
        }
    }
}

#[tauri::command]
pub async fn select_project_folder() -> Result<String, String> {
    // This will be implemented with Tauri's dialog API
    Ok("/Users/mac/CascadeProjects/Viz Venture Group".to_string())
}

#[tauri::command]
pub async fn read_screenshot(screenshot_path: String) -> Result<Vec<u8>, String> {
    match std::fs::read(&screenshot_path) {
        Ok(data) => Ok(data),
        Err(e) => Err(format!("Failed to read screenshot: {}", e)),
    }
}

#[tauri::command]
pub async fn list_screenshots(project_path: String) -> Result<Vec<String>, String> {
    let screenshots_dir = format!("{}/screenshots", project_path);
    
    match std::fs::read_dir(&screenshots_dir) {
        Ok(entries) => {
            let mut screenshots = Vec::new();
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Some(path) = entry.path().to_str() {
                        if path.ends_with(".png") || path.ends_with(".jpg") {
                            screenshots.push(path.to_string());
                        }
                    }
                }
            }
            Ok(screenshots)
        }
        Err(_) => Ok(Vec::new()),
    }
}

#[tauri::command]
pub async fn read_file_content(file_path: String) -> Result<String, String> {
    match fs::read_to_string(&file_path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

#[tauri::command]
pub async fn write_file_content(file_path: String, content: String) -> Result<(), String> {
    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    
    match fs::write(&file_path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}

#[tauri::command]
pub async fn execute_command(command: String, args: Vec<String>, cwd: Option<String>) -> Result<TestResult, String> {
    let mut cmd = Command::new(&command);
    
    if let Some(working_dir) = cwd {
        cmd.current_dir(working_dir);
    }
    
    cmd.args(&args);
    
    match cmd.output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            
            Ok(TestResult {
                success: output.status.success(),
                output: stdout,
                error: if stderr.is_empty() { None } else { Some(stderr) },
            })
        }
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

#[tauri::command]
pub async fn list_directory(dir_path: String) -> Result<Vec<FileInfo>, String> {
    match fs::read_dir(&dir_path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Ok(metadata) = entry.metadata() {
                        if let Some(name) = entry.file_name().to_str() {
                            files.push(FileInfo {
                                name: name.to_string(),
                                path: entry.path().to_string_lossy().to_string(),
                                is_directory: metadata.is_dir(),
                                size: if metadata.is_file() { Some(metadata.len()) } else { None },
                            });
                        }
                    }
                }
            }
            Ok(files)
        }
        Err(e) => Err(format!("Failed to read directory: {}", e)),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub size: Option<u64>,
}
