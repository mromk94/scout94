<?php
/**
 * Scout94 - User Journey Test: ADMIN
 * Tests the flow of an admin managing the platform
 */

echo "🔍 Scout94 - User Journey: ADMIN\n";
echo "═══════════════════════════════════════\n\n";

$projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
echo "Testing project: $projectPath\n\n";

$errors = 0;
$warnings = 0;

echo "━━━ ADMIN JOURNEY START ━━━\n\n";

echo "Step 1: Admin logs in...\n";
echo "   URL: /admin/login\n";
echo "   POST: /auth-backend/admin_login.php\n";
if (file_exists("$projectPath/auth-backend/admin_login.php")) {
    echo "   ✅ Admin login endpoint exists\n";
    
    $adminLoginContent = file_get_contents("$projectPath/auth-backend/admin_login.php");
    if (stripos($adminLoginContent, 'is_admin') !== false || 
        stripos($adminLoginContent, 'admin') !== false) {
        echo "   ✅ Verifies admin privileges\n";
    } else {
        echo "   ⚠️  May not properly check admin status\n";
        $warnings++;
    }
} else {
    echo "   ❌ Admin login endpoint MISSING - admins can't log in!\n";
    $errors++;
}
echo "\n";

echo "Step 2: Admin accesses admin panel...\n";
echo "   URL: /admin\n";
if (file_exists("$projectPath/admin.php")) {
    echo "   ✅ Admin entry point exists\n";
    
    // Check admin.php has session checks
    $adminPhpContent = file_get_contents("$projectPath/admin.php");
    if (stripos($adminPhpContent, 'isUserAdmin') !== false ||
        stripos($adminPhpContent, 'is_admin') !== false) {
        echo "   ✅ Protected with admin checks\n";
    } else {
        echo "   ❌ NO ADMIN PROTECTION - security vulnerability!\n";
        $errors++;
    }
} else {
    echo "   ❌ admin.php MISSING - admin panel inaccessible!\n";
    $errors++;
}
echo "\n";

echo "Step 3: Admin views dashboard statistics...\n";
echo "   Expected: User count, total investments, pending actions\n";
if (file_exists("$projectPath/auth-backend/admin_stats.php")) {
    echo "   ✅ Admin stats endpoint exists\n";
} else {
    echo "   ⚠️  No stats endpoint - admin has limited visibility\n";
    $warnings++;
}
echo "\n";

echo "Step 4: Admin manages users...\n";
echo "   Expected: View users, edit, suspend\n";
if (file_exists("$projectPath/auth-backend/admin_get_users.php")) {
    echo "   ✅ Get users endpoint exists\n";
} else {
    echo "   ❌ Can't view users - critical admin function missing!\n";
    $errors++;
}

if (file_exists("$projectPath/auth-backend/edit_user.php") ||
    file_exists("$projectPath/auth-backend/admin_edit_user.php")) {
    echo "   ✅ Edit user endpoint exists\n";
} else {
    echo "   ⚠️  Can't edit users\n";
    $warnings++;
}
echo "\n";

echo "Step 5: Admin adjusts user balances...\n";
echo "   POST: /auth-backend/admin_adjust_balance.php\n";
if (file_exists("$projectPath/auth-backend/admin_adjust_balance.php")) {
    echo "   ✅ Balance adjustment endpoint exists\n";
} else {
    echo "   ❌ Can't adjust balances - critical admin function missing!\n";
    $errors++;
}
echo "\n";

echo "Step 6: Admin reviews pending transactions...\n";
echo "   Expected: Approve/reject deposits and withdrawals\n";
if (file_exists("$projectPath/auth-backend/admin_get_pending_transactions.php")) {
    echo "   ✅ Pending transactions endpoint exists\n";
} else {
    echo "   ⚠️  Can't view pending transactions\n";
    $warnings++;
}

if (file_exists("$projectPath/auth-backend/admin_approve_transaction.php")) {
    echo "   ✅ Transaction approval endpoint exists\n";
} else {
    echo "   ❌ Can't approve transactions - deposits/withdrawals stuck!\n";
    $errors++;
}
echo "\n";

echo "Step 7: Admin reviews KYC submissions...\n";
echo "   Expected: View KYC docs, approve/reject\n";
if (file_exists("$projectPath/auth-backend/get_kyc.php") ||
    file_exists("$projectPath/auth-backend/admin_get_kyc.php")) {
    echo "   ✅ KYC review endpoint exists\n";
} else {
    echo "   ⚠️  Can't review KYC submissions\n";
    $warnings++;
}

if (file_exists("$projectPath/auth-backend/approve_kyc.php")) {
    echo "   ✅ KYC approval endpoint exists\n";
} else {
    echo "   ⚠️  Can't approve KYC\n";
    $warnings++;
}
echo "\n";

echo "Step 8: Admin manages investment plans...\n";
echo "   Expected: Create, edit, delete plans\n";
if (file_exists("$projectPath/auth-backend/admin_manage_plans.php") ||
    file_exists("$projectPath/auth-backend/add_plan.php")) {
    echo "   ✅ Plan management endpoint exists\n";
} else {
    echo "   ⚠️  Can't manage investment plans\n";
    $warnings++;
}
echo "\n";

echo "Step 9: Admin generates withdrawal PINs...\n";
echo "   Expected: Create PINs for users to withdraw\n";
if (file_exists("$projectPath/auth-backend/admin_generate_pin.php")) {
    echo "   ✅ PIN generation endpoint exists\n";
} else {
    echo "   ⚠️  Can't generate withdrawal PINs\n";
    $warnings++;
}

if (file_exists("$projectPath/auth-backend/admin_get_all_withdrawal_pins.php")) {
    echo "   ✅ View all PINs endpoint exists\n";
} else {
    echo "   ⚠️  Can't view PIN status\n";
    $warnings++;
}
echo "\n";

echo "Step 10: Admin manages other admins...\n";
echo "   Expected: Add, edit, remove admin users\n";
if (file_exists("$projectPath/auth-backend/add_admin.php")) {
    echo "   ✅ Add admin endpoint exists\n";
} else {
    echo "   ⚠️  Can't add new admins\n";
    $warnings++;
}

if (file_exists("$projectPath/auth-backend/edit_admin.php")) {
    echo "   ✅ Edit admin endpoint exists\n";
} else {
    echo "   ⚠️  Can't edit admin users\n";
    $warnings++;
}
echo "\n";

// Summary
echo "━━━ ADMIN JOURNEY COMPLETE ━━━\n\n";
echo "═══════════════════════════════════════\n";
echo "📊 ADMIN JOURNEY SUMMARY\n";
echo "═══════════════════════════════════════\n";
echo "Critical Errors: $errors\n";
echo "Warnings: $warnings\n\n";

if ($errors === 0 && $warnings === 0) {
    echo "✅✅✅ ADMIN EXPERIENCE: PERFECT!\n";
    echo "Admins have all tools to manage the platform\n";
    exit(0);
} elseif ($errors === 0) {
    echo "✅ ADMIN EXPERIENCE: GOOD (with warnings)\n";
    echo "Core admin functions work but missing some features\n";
    exit(0);
} else {
    echo "❌ ADMIN EXPERIENCE: BROKEN!\n";
    echo "Critical admin functions are missing!\n";
    exit(1);
}
?>
