use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoteScanResult {
    pub success: bool,
    pub output: String,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoteConfig {
    pub host: String,
    pub user: String,
    pub port: Option<u16>,
    pub key_path: Option<String>,
    pub remote_path: String,
}

/// Deploy Scout94 scanner to remote machine via SSH
#[tauri::command]
pub async fn deploy_scanner_remote(config: RemoteConfig) -> Result<RemoteScanResult, String> {
    println!("🚀 Deploying Scout94 scanner to remote: {}@{}", config.user, config.host);
    
    // Get Scout94 directory
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/Users/mac".to_string());
    let scout94_dir = format!("{}/CascadeProjects/scout94", home_dir);
    
    let port = config.port.unwrap_or(22);
    let remote_host = format!("{}@{}", config.user, config.host);
    
    // Build SSH command with optional key
    let mut ssh_base_args = vec![
        "-p".to_string(),
        port.to_string(),
    ];
    
    if let Some(key_path) = &config.key_path {
        ssh_base_args.extend(vec!["-i".to_string(), key_path.clone()]);
    }
    
    // Step 1: Create remote directory
    println!("📁 Creating remote directory...");
    let mut mkdir_args = ssh_base_args.clone();
    mkdir_args.extend(vec![
        remote_host.clone(),
        format!("mkdir -p {}/scout94", config.remote_path)
    ]);
    
    let mkdir_output = Command::new("ssh")
        .args(&mkdir_args)
        .output()
        .map_err(|e| format!("Failed to create remote directory: {}", e))?;
    
    if !mkdir_output.status.success() {
        return Err(format!("Failed to create remote directory: {}", 
            String::from_utf8_lossy(&mkdir_output.stderr)));
    }
    
    // Step 2: Deploy scanner files via SCP
    println!("📤 Deploying scanner files...");
    let remote_dest = format!("{}:{}/scout94/", remote_host, config.remote_path);
    
    let mut scp_args = vec![
        "-P".to_string(),
        port.to_string(),
        "-r".to_string(),
    ];
    
    if let Some(key_path) = &config.key_path {
        scp_args.extend(vec!["-i".to_string(), key_path.clone()]);
    }
    
    scp_args.extend(vec![
        format!("{}/*", scout94_dir),
        remote_dest,
    ]);
    
    let scp_output = Command::new("scp")
        .args(&scp_args)
        .output()
        .map_err(|e| format!("Failed to deploy files: {}", e))?;
    
    if !scp_output.status.success() {
        return Err(format!("Failed to deploy files: {}", 
            String::from_utf8_lossy(&scp_output.stderr)));
    }
    
    println!("✅ Scanner deployed successfully!");
    
    Ok(RemoteScanResult {
        success: true,
        output: format!("Scout94 scanner deployed to {}:{}/scout94/", config.host, config.remote_path),
        error: None,
    })
}

/// Run Scout94 tests on remote machine
#[tauri::command]
pub async fn run_scout94_remote(config: RemoteConfig, test_type: String, target_project_path: String) -> Result<RemoteScanResult, String> {
    println!("🔍 Running Scout94 test remotely: {} on {}", test_type, config.host);
    
    let port = config.port.unwrap_or(22);
    let remote_host = format!("{}@{}", config.user, config.host);
    
    // Map test types to Scout94's test scripts
    let test_script = match test_type.as_str() {
        "routing" => "test_routing.php",
        "visitor" => "test_user_journey_visitor.php",
        "user" => "test_user_journey_user.php",
        "admin" => "test_user_journey_admin.php",
        "database" => "test_install_db.php",
        "audit" => "run_with_audit.php",
        "all" => "run_all_tests.php",
        _ => "run_all_tests.php",
    };
    
    let remote_test_path = format!("{}/scout94/{}", config.remote_path, test_script);
    
    // Build SSH command
    let mut ssh_args = vec![
        "-p".to_string(),
        port.to_string(),
    ];
    
    if let Some(key_path) = &config.key_path {
        ssh_args.extend(vec!["-i".to_string(), key_path.clone()]);
    }
    
    // Execute test script remotely
    ssh_args.extend(vec![
        remote_host,
        format!("cd {} && php {}", target_project_path, remote_test_path)
    ]);
    
    println!("📋 Executing: ssh {} (remote test)", test_script);
    
    let output = Command::new("ssh")
        .args(&ssh_args)
        .output()
        .map_err(|e| format!("Failed to execute remote test: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    if output.status.success() {
        println!("✅ Remote test completed successfully");
        Ok(RemoteScanResult {
            success: true,
            output: stdout,
            error: None,
        })
    } else {
        println!("❌ Remote test failed");
        Ok(RemoteScanResult {
            success: false,
            output: stdout,
            error: Some(stderr),
        })
    }
}

/// Check if remote host is accessible
#[tauri::command]
pub async fn check_remote_access(config: RemoteConfig) -> Result<bool, String> {
    let port = config.port.unwrap_or(22);
    let remote_host = format!("{}@{}", config.user, config.host);
    
    let mut ssh_args = vec![
        "-p".to_string(),
        port.to_string(),
        "-o".to_string(),
        "ConnectTimeout=5".to_string(),
    ];
    
    if let Some(key_path) = &config.key_path {
        ssh_args.extend(vec!["-i".to_string(), key_path.clone()]);
    }
    
    ssh_args.extend(vec![
        remote_host,
        "echo 'Connected'".to_string()
    ]);
    
    let output = Command::new("ssh")
        .args(&ssh_args)
        .output()
        .map_err(|e| format!("Failed to check remote access: {}", e))?;
    
    Ok(output.status.success())
}
