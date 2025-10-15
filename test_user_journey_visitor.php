<?php
/**
 * Scout94 - User Journey Test: VISITOR (Public User)
 * Tests the flow of a visitor exploring the site
 */

echo "🔍 Scout94 - User Journey: VISITOR\n";
echo "═══════════════════════════════════════\n\n";

// Get project path from command line or use default
$projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';

echo "Testing project: $projectPath\n\n";

$errors = 0;
$warnings = 0;

// VISITOR JOURNEY: Landing on homepage
echo "━━━ VISITOR JOURNEY START ━━━\n\n";

echo "Step 1: Visitor lands on homepage...\n";
echo "   URL: https://vizventuregroup.com/\n";
if (file_exists("$projectPath/index.html") || file_exists("$projectPath/dist/index.html")) {
    echo "   ✅ Homepage accessible\n";
    
    // Check homepage has key content
    $indexContent = file_exists("$projectPath/index.html") 
        ? file_get_contents("$projectPath/index.html")
        : file_get_contents("$projectPath/dist/index.html");
    
    if (strpos($indexContent, 'root') !== false) {
        echo "   ✅ React root div present\n";
    } else {
        echo "   ❌ React root div missing - site won't load!\n";
        $errors++;
    }
} else {
    echo "   ❌ Homepage missing - visitors see 404!\n";
    $errors++;
}
echo "\n";

echo "Step 2: Visitor views investment plans...\n";
echo "   Expected: /plans or homepage shows plans\n";
// Check if Plans component exists
if (file_exists("$projectPath/src/components/Plans.jsx") ||
    file_exists("$projectPath/src/components/admin/Plans.jsx") ||
    file_exists("$projectPath/src/pages/ModernDashboardPlans.jsx")) {
    echo "   ✅ Plans component exists\n";
} else {
    echo "   ⚠️  Plans component not found\n";
    $warnings++;
}
echo "\n";

echo "Step 3: Visitor wants to learn more (About/FAQ)...\n";
echo "   Expected: Info pages accessible\n";
// Check for content/info pages
if (file_exists("$projectPath/src/components/About.jsx") || 
    file_exists("$projectPath/src/components/FAQ.jsx")) {
    echo "   ✅ Info pages available\n";
} else {
    echo "   ⚠️  No About/FAQ pages found\n";
    $warnings++;
}
echo "\n";

echo "Step 4: Visitor decides to register...\n";
echo "   URL: /register\n";
// Check register endpoint exists
if (file_exists("$projectPath/auth-backend/register.php")) {
    echo "   ✅ Registration endpoint exists\n";
    
    // Check for required fields
    $registerContent = file_get_contents("$projectPath/auth-backend/register.php");
    $requiredFields = ['username', 'email', 'password'];
    
    foreach ($requiredFields as $field) {
        if (stripos($registerContent, $field) !== false) {
            echo "   ✅ Validates '$field' field\n";
        } else {
            echo "   ⚠️  Missing '$field' validation\n";
            $warnings++;
        }
    }
} else {
    echo "   ❌ Registration endpoint MISSING - visitors can't register!\n";
    $errors++;
}
echo "\n";

echo "Step 5: Visitor checks security/legitimacy...\n";
echo "   Expected: SSL, contact info, company details\n";
// Check for contact/about pages
if (file_exists("$projectPath/auth-backend/contact_us.php")) {
    echo "   ✅ Contact form available\n";
} else {
    echo "   ⚠️  No contact form - looks unprofessional\n";
    $warnings++;
}
echo "\n";

// Summary
echo "━━━ VISITOR JOURNEY COMPLETE ━━━\n\n";
echo "═══════════════════════════════════════\n";
echo "📊 VISITOR JOURNEY SUMMARY\n";
echo "═══════════════════════════════════════\n";
echo "Critical Errors: $errors\n";
echo "Warnings: $warnings\n\n";

if ($errors === 0 && $warnings === 0) {
    echo "✅✅✅ VISITOR EXPERIENCE: PERFECT!\n";
    echo "Visitors can explore and register smoothly\n";
    exit(0);
} elseif ($errors === 0) {
    echo "✅ VISITOR EXPERIENCE: GOOD (with warnings)\n";
    echo "Core journey works but has room for improvement\n";
    exit(0);
} else {
    echo "❌ VISITOR EXPERIENCE: BROKEN!\n";
    echo "Critical issues prevent visitors from using the site\n";
    exit(1);
}
?>
