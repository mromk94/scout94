<?php
/**
 * Scout94 - Routing Validation Test
 * Tests that all routing configurations are correct and prevent 404 errors
 */

echo "🔍 Scout94 - Routing Validation Test\n";
echo "═══════════════════════════════════════\n\n";

// Get project path from command line or use default
$projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
echo "Testing project: $projectPath\n\n";

$errors = 0;
$warnings = 0;

// Test 1: Root index.html exists
echo "Test 1: Root index.html exists...\n";
if (file_exists("$projectPath/index.html")) {
    echo "✅ Root index.html found\n\n";
} else {
    echo "❌ Root index.html MISSING!\n";
    echo "   This will cause 404 on /admin/login\n\n";
    $errors++;
}

// Test 2: Root index.html is production version
echo "Test 2: Root index.html is production version...\n";
if (file_exists("$projectPath/index.html")) {
    $content = file_get_contents("$projectPath/index.html");
    
    if (strpos($content, '/dist/assets/index.js') !== false) {
        echo "✅ Production version (loads /dist/assets/)\n\n";
    } elseif (strpos($content, '/src/main.jsx') !== false) {
        echo "❌ DEV VERSION DETECTED!\n";
        echo "   Loads /src/main.jsx instead of /dist/assets/index.js\n";
        echo "   This will cause 404 errors in production\n\n";
        $errors++;
    } else {
        echo "⚠️  Unknown version or broken\n\n";
        $warnings++;
    }
} else {
    echo "⚠️  Skipped (file doesn't exist)\n\n";
}

// Test 3: .htaccess exists
echo "Test 3: .htaccess exists...\n";
if (file_exists("$projectPath/.htaccess")) {
    echo "✅ .htaccess found\n\n";
} else {
    echo "❌ .htaccess MISSING!\n";
    echo "   Routing will not work without this file\n\n";
    $errors++;
}

// Test 4: .htaccess has admin/login route
echo "Test 4: .htaccess routes /admin/login...\n";
if (file_exists("$projectPath/.htaccess")) {
    $htaccess = file_get_contents("$projectPath/.htaccess");
    
    if (strpos($htaccess, 'admin/login') !== false && strpos($htaccess, 'index.html') !== false) {
        echo "✅ /admin/login route configured\n\n";
    } else {
        echo "❌ /admin/login route NOT FOUND in .htaccess\n";
        echo "   Add: RewriteRule ^admin/login$ index.html [L]\n\n";
        $errors++;
    }
} else {
    echo "⚠️  Skipped (file doesn't exist)\n\n";
}

// Test 5: admin.php exists
echo "Test 5: admin.php exists...\n";
if (file_exists("$projectPath/admin.php")) {
    echo "✅ admin.php found\n\n";
} else {
    echo "❌ admin.php MISSING!\n";
    echo "   /admin route will return 404\n\n";
    $errors++;
}

// Test 6: admin.php serves correct index.html
echo "Test 6: admin.php serves correct path...\n";
if (file_exists("$projectPath/admin.php")) {
    $adminPhp = file_get_contents("$projectPath/admin.php");
    
    if (strpos($adminPhp, "readfile(__DIR__ . '/index.html')") !== false) {
        echo "✅ admin.php serves root index.html\n\n";
    } else {
        echo "⚠️  admin.php may serve wrong path\n";
        echo "   Check readfile() calls\n\n";
        $warnings++;
    }
} else {
    echo "⚠️  Skipped (file doesn't exist)\n\n";
}

// Test 7: dist/index.html exists
echo "Test 7: dist/index.html exists...\n";
if (file_exists("$projectPath/dist/index.html")) {
    echo "✅ dist/index.html found\n\n";
} else {
    echo "❌ dist/index.html MISSING!\n";
    echo "   Run 'npm run build' to create production build\n\n";
    $errors++;
}

// Test 8: dist/assets/ has files
echo "Test 8: dist/assets/ has content...\n";
if (is_dir("$projectPath/dist/assets/")) {
    $files = scandir("$projectPath/dist/assets/");
    $fileCount = count($files) - 2; // Exclude . and ..
    
    if ($fileCount > 0) {
        echo "✅ Found $fileCount files in dist/assets/\n\n";
    } else {
        echo "❌ dist/assets/ is EMPTY!\n";
        echo "   Run 'npm run build'\n\n";
        $errors++;
    }
} else {
    echo "❌ dist/assets/ directory MISSING!\n\n";
    $errors++;
}

// Test 9: Compare root and dist index.html
echo "Test 9: Root index.html matches dist structure...\n";
if (file_exists("$projectPath/index.html") && file_exists("$projectPath/dist/index.html")) {
    $rootIndex = file_get_contents("$projectPath/index.html");
    $distIndex = file_get_contents("$projectPath/dist/index.html");
    
    // Root should reference /dist/assets/, dist should reference /assets/
    $rootHasDistPath = strpos($rootIndex, '/dist/assets/') !== false;
    $distHasRelativePath = strpos($distIndex, '/assets/') !== false;
    
    if ($rootHasDistPath && $distHasRelativePath) {
        echo "✅ Both index.html files have correct paths\n\n";
    } else {
        echo "⚠️  Path configuration mismatch\n";
        echo "   Root should use: /dist/assets/\n";
        echo "   Dist should use: /assets/\n\n";
        $warnings++;
    }
} else {
    echo "⚠️  Skipped (files don't exist)\n\n";
}

// Summary
echo "═══════════════════════════════════════\n";
echo "📊 ROUTING VALIDATION SUMMARY\n";
echo "═══════════════════════════════════════\n";
echo "Errors: $errors\n";
echo "Warnings: $warnings\n\n";

if ($errors === 0 && $warnings === 0) {
    echo "✅✅✅ ROUTING: PERFECT!\n";
    echo "All routes configured correctly\n";
    exit(0);
} elseif ($errors === 0) {
    echo "✅ ROUTING: WORKING (with warnings)\n";
    echo "Routes should work but review warnings\n";
    exit(0);
} else {
    echo "❌ ROUTING: ISSUES DETECTED!\n";
    echo "Fix errors before deploying\n";
    exit(1);
}
?>
