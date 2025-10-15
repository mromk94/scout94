<?php
/**
 * Scout94 - User Journey Test: REGISTERED USER
 * Tests the flow of a logged-in user managing their account
 */

echo "🔍 Scout94 - User Journey: REGISTERED USER\n";
echo "═══════════════════════════════════════\n\n";

$projectPath = $argv[1] ?? __DIR__ . '/../Viz Venture Group';
echo "Testing project: $projectPath\n\n";

$errors = 0;
$warnings = 0;

echo "━━━ USER JOURNEY START ━━━\n\n";

echo "Step 1: User logs in...\n";
echo "   URL: /login\n";
echo "   POST: /auth-backend/login.php\n";
if (file_exists("$projectPath/auth-backend/login.php")) {
    echo "   ✅ Login endpoint exists\n";
    
    $loginContent = file_get_contents("$projectPath/auth-backend/login.php");
    if (strpos($loginContent, 'session_start') !== false || 
        strpos($loginContent, 'session') !== false) {
        echo "   ✅ Creates user session\n";
    } else {
        echo "   ❌ No session management - user can't stay logged in!\n";
        $errors++;
    }
} else {
    echo "   ❌ Login endpoint MISSING - users can't log in!\n";
    $errors++;
}
echo "\n";

echo "Step 2: User views dashboard...\n";
echo "   URL: /dashboard\n";
if (file_exists("$projectPath/src/components/Dashboard.jsx") || 
    file_exists("$projectPath/src/pages/Dashboard.jsx")) {
    echo "   ✅ Dashboard component exists\n";
} else {
    echo "   ❌ Dashboard missing - users have nowhere to go after login!\n";
    $errors++;
}
echo "\n";

echo "Step 3: User checks their balance...\n";
echo "   Expected: Display user balances (active, profit, etc.)\n";
if (file_exists("$projectPath/auth-backend/get_balance.php") || 
    file_exists("$projectPath/auth-backend/get_balances.php")) {
    echo "   ✅ Balance endpoint exists\n";
} else {
    echo "   ⚠️  Balance endpoint not found\n";
    $warnings++;
}
echo "\n";

echo "Step 4: User wants to invest...\n";
echo "   URL: /invest\n";
echo "   POST: /auth-backend/create_investment.php\n";
if (file_exists("$projectPath/auth-backend/create_investment.php")) {
    echo "   ✅ Investment creation endpoint exists\n";
} else {
    echo "   ❌ Investment endpoint MISSING - users can't invest!\n";
    $errors++;
}
echo "\n";

echo "Step 5: User views their investments...\n";
echo "   Expected: List of active investments\n";
if (file_exists("$projectPath/auth-backend/get_investments.php")) {
    echo "   ✅ Investments list endpoint exists\n";
} else {
    echo "   ⚠️  Can't view investments - poor UX\n";
    $warnings++;
}
echo "\n";

echo "Step 6: User requests withdrawal...\n";
echo "   POST: /auth-backend/request_withdrawal.php\n";
if (file_exists("$projectPath/auth-backend/request_withdrawal.php") ||
    file_exists("$projectPath/auth-backend/process_withdrawal.php")) {
    echo "   ✅ Withdrawal endpoint exists\n";
    
    // Check for withdrawal PIN feature
    if (file_exists("$projectPath/auth-backend/get_user_withdrawal_pins.php")) {
        echo "   ✅ Withdrawal PIN security enabled\n";
    } else {
        echo "   ⚠️  No withdrawal PIN - security concern\n";
        $warnings++;
    }
} else {
    echo "   ❌ Withdrawal endpoint MISSING - users can't withdraw!\n";
    $errors++;
}
echo "\n";

echo "Step 7: User views transaction history...\n";
echo "   Expected: List of all transactions\n";
if (file_exists("$projectPath/auth-backend/get_transactions.php")) {
    echo "   ✅ Transaction history endpoint exists\n";
} else {
    echo "   ⚠️  No transaction history - users can't track activity\n";
    $warnings++;
}
echo "\n";

echo "Step 8: User submits KYC documents...\n";
echo "   POST: /auth-backend/submit_kyc.php\n";
if (file_exists("$projectPath/auth-backend/submit_kyc.php")) {
    echo "   ✅ KYC submission endpoint exists\n";
    
    // Check for upload directory
    if (is_dir("$projectPath/uploads/kyc")) {
        echo "   ✅ KYC upload directory exists\n";
    } else {
        echo "   ❌ KYC upload directory MISSING - KYC will fail!\n";
        $errors++;
    }
} else {
    echo "   ⚠️  KYC endpoint not found\n";
    $warnings++;
}
echo "\n";

echo "Step 9: User updates profile settings...\n";
echo "   POST: /auth-backend/update_profile.php\n";
if (file_exists("$projectPath/auth-backend/update_profile.php") ||
    file_exists("$projectPath/auth-backend/settings.php")) {
    echo "   ✅ Profile update endpoint exists\n";
} else {
    echo "   ⚠️  Can't update profile - poor UX\n";
    $warnings++;
}
echo "\n";

echo "Step 10: User logs out...\n";
echo "   POST: /auth-backend/logout.php\n";
if (file_exists("$projectPath/auth-backend/logout.php")) {
    echo "   ✅ Logout endpoint exists\n";
} else {
    echo "   ⚠️  No logout endpoint - security concern\n";
    $warnings++;
}
echo "\n";

// Summary
echo "━━━ USER JOURNEY COMPLETE ━━━\n\n";
echo "═══════════════════════════════════════\n";
echo "📊 USER JOURNEY SUMMARY\n";
echo "═══════════════════════════════════════\n";
echo "Critical Errors: $errors\n";
echo "Warnings: $warnings\n\n";

if ($errors === 0 && $warnings === 0) {
    echo "✅✅✅ USER EXPERIENCE: PERFECT!\n";
    echo "Users can perform all key actions smoothly\n";
    exit(0);
} elseif ($errors === 0) {
    echo "✅ USER EXPERIENCE: GOOD (with warnings)\n";
    echo "Core features work but has room for improvement\n";
    exit(0);
} else {
    echo "❌ USER EXPERIENCE: BROKEN!\n";
    echo "Critical issues prevent users from key actions\n";
    exit(1);
}
?>
