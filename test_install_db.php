<?php
/**
 * Test Install Database Injection
 * Verifies that the install flow properly creates database tables
 */

echo "🔍 Testing Install Database Injection Flow\n\n";

// Test database connection
$testDb = [
    'host' => 'localhost',
    'name' => 'vizventuregroup_test_install',
    'user' => 'root',
    'pass' => ''
];

echo "Step 1: Connecting to MySQL...\n";
try {
    $pdo = new PDO(
        "mysql:host={$testDb['host']};charset=utf8mb4",
        $testDb['user'],
        $testDb['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Connected to MySQL\n\n";
} catch (PDOException $e) {
    die("❌ Failed to connect: " . $e->getMessage() . "\n");
}

echo "Step 2: Creating test database...\n";
try {
    $pdo->exec("DROP DATABASE IF EXISTS `{$testDb['name']}`");
    $pdo->exec("CREATE DATABASE `{$testDb['name']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `{$testDb['name']}`");
    echo "✅ Database created\n\n";
} catch (PDOException $e) {
    die("❌ Failed to create database: " . $e->getMessage() . "\n");
}

echo "Step 3: Reading schema file...\n";
$schemaFile = __DIR__ . '/../install/tonsui_schema.sql';
if (!file_exists($schemaFile)) {
    die("❌ Schema file not found: $schemaFile\n");
}
$sql = file_get_contents($schemaFile);
echo "✅ Schema file loaded (" . strlen($sql) . " bytes)\n\n";

echo "Step 4: Parsing SQL queries...\n";
$sql = str_replace(["\r\n", "\r"], "\n", $sql);
$sql = preg_replace("/--.*?\n/", "", $sql);
$sql = preg_replace("/#.*?\n/", "", $sql);
$sql = preg_replace("/\/\*.*?\*\//s", "", $sql);

$queries = [];
$offset = 0;
while (($pos = strpos($sql, ';', $offset)) !== false) {
    $query = trim(substr($sql, $offset, $pos - $offset));
    if (!empty($query) && !preg_match('/^\s*$/s', $query)) {
        $queries[] = $query;
    }
    $offset = $pos + 1;
}
echo "✅ Found " . count($queries) . " queries\n\n";

echo "Step 5: Executing queries...\n";
$executed = 0;
$failed = 0;
foreach ($queries as $i => $query) {
    try {
        $pdo->exec($query);
        $executed++;
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') === false) {
            echo "⚠️  Query #" . ($i + 1) . " failed: " . substr($e->getMessage(), 0, 100) . "...\n";
            $failed++;
        }
    }
}
echo "✅ Executed $executed queries successfully\n";
if ($failed > 0) {
    echo "⚠️  $failed queries failed\n";
}
echo "\n";

echo "Step 6: Verifying tables created...\n";
$tablesResult = $pdo->query("SHOW TABLES");
$tables = $tablesResult->fetchAll(PDO::FETCH_COLUMN);
echo "✅ Found " . count($tables) . " tables:\n";
foreach ($tables as $table) {
    echo "   - $table\n";
}
echo "\n";

echo "Step 7: Checking critical tables...\n";
$requiredTables = [
    'admins',
    'users',
    'investments',
    'transactions',
    'kyc_documents',
    'payment_methods',
    'withdrawal_pins',
    'settings',
    'notifications'
];

$missing = [];
foreach ($requiredTables as $table) {
    if (in_array($table, $tables)) {
        echo "✅ $table\n";
    } else {
        echo "❌ $table (MISSING!)\n";
        $missing[] = $table;
    }
}
echo "\n";

echo "Step 8: Testing admin user creation...\n";
try {
    $stmt = $pdo->prepare("INSERT INTO admins (name, username, email, password, is_admin, status, created_at) 
                           VALUES (?, ?, ?, ?, 1, 'active', NOW())");
    $stmt->execute([
        'Test Admin',
        'testadmin',
        'test@vizventuregroup.com',
        password_hash('testpassword123', PASSWORD_BCRYPT)
    ]);
    echo "✅ Admin user created successfully\n";
    
    $verifyStmt = $pdo->query("SELECT id, username, email FROM admins WHERE username = 'testadmin'");
    $admin = $verifyStmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Verified: ID={$admin['id']}, Username={$admin['username']}, Email={$admin['email']}\n";
} catch (PDOException $e) {
    echo "❌ Failed to create admin: " . $e->getMessage() . "\n";
}
echo "\n";

echo "Step 9: Cleanup...\n";
$pdo->exec("DROP DATABASE `{$testDb['name']}`");
echo "✅ Test database dropped\n\n";

echo "═══════════════════════════════════════\n";
echo "📊 INSTALL DATABASE INJECTION TEST SUMMARY\n";
echo "═══════════════════════════════════════\n";
echo "Total Queries: " . count($queries) . "\n";
echo "Executed Successfully: $executed\n";
echo "Failed: $failed\n";
echo "Tables Created: " . count($tables) . "\n";
echo "Missing Critical Tables: " . count($missing) . "\n";

if (count($missing) === 0 && $executed > 0) {
    echo "\n✅✅✅ INSTALL FLOW: WORKING PERFECTLY!\n";
} else {
    echo "\n❌ INSTALL FLOW: ISSUES DETECTED!\n";
    if (count($missing) > 0) {
        echo "Missing tables: " . implode(', ', $missing) . "\n";
    }
}
echo "═══════════════════════════════════════\n";
?>
