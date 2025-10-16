/**
 * Scout94 Configuration Schema
 * 
 * Purpose: Default configuration values for all settings
 * Source: Based on ADMIN_SETTINGS_PANEL_TODO.md comprehensive analysis
 * 
 * All values match documented defaults from:
 * - MATHEMATICAL_FRAMEWORK.md (weights, thresholds)
 * - RETRY_FLOWS_COMPLETE.md (retry logic)
 * - MULTI_LLM_PLAN.md (LLM assignments)
 * - And 15+ other specification documents
 */

export const defaultConfig = {
  version: '1.0.0',
  
  // SECTION 1: GENERAL SETTINGS
  general: {
    projectPath: '',
    projectName: '',
    primaryLanguage: 'auto-detect',
    framework: 'auto-detect',
    autoDetectTechStack: true,
    cacheProjectStructure: true,
    
    executionMode: 'audit', // basic | audit | clinic | visual | comprehensive
    autoRunBackground: false,
    showDesktopNotifications: true,
    autoOpenReports: true,
    
    maxExecutionTime: 120, // minutes
    parallelProcesses: 4,
    memoryLimitMB: 2048,
    aggressiveCaching: false,
    prioritizeSpeed: false
  },
  
  // SECTION 2: AGENT CONFIGURATION
  agents: {
    scout94: {
      enabled: true,
      priority: 'high', // low | medium | high | critical
      testSuites: {
        database: true,
        routing: true,
        userJourneys: true,
        stressTesting: false
      },
      reporting: {
        incrementalUpdates: true,
        generateSummary: true,
        includeCoverage: true
      },
      chatPersonality: 'professional', // professional | casual | fun
      verbosity: 0.5, // 0-1 scale
      updateFrequency: 'realtime' // realtime | every5s | every10s | onComplete
    },
    auditor: {
      enabled: true,
      priority: 'critical',
      threshold: 5, // 3-7, pass/fail cutoff
      scoringWeights: {
        completeness: 0.33,
        methodology: 0.33,
        coverage: 0.34
      },
      retrySensitivity: 'balanced', // aggressive | balanced | conservative
      recommendationDetail: 'medium', // low | medium | high
      reportFormat: 'detailed' // concise | balanced | detailed
    },
    doctor: {
      enabled: true,
      priority: 'high',
      diagnosisDepth: 'standard', // quick | standard | deep
      issuePrioritization: 'severity', // severity | impact | effort
      treatmentMode: 'balanced', // conservative | balanced | aggressive
      verifyFormulas: true,
      prescriptionDetail: 'high'
    },
    nurse: {
      enabled: true,
      priority: 'medium',
      safetyLevel: 'balanced', // conservative | balanced | aggressive
      autoApplyThreshold: 30, // risk score < X
      sandboxStrictness: 'high', // low | medium | high
      loggingVerbosity: 'medium',
      successCriteria: 'health>=70'
    },
    screenshot: {
      enabled: false,
      priority: 'low',
      criticalPages: ['/', '/login', '/register', '/dashboard', '/invest'],
      viewports: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
      ],
      visualDiffThreshold: 5, // percent
      aiAnalysis: false,
      storageLocation: '.scout94_screenshots'
    },
    backend: {
      enabled: false,
      priority: 'medium',
      endpoints: [],
      authMethods: ['session', 'jwt', 'basic'],
      rateLimitTests: true,
      loadTestParams: { duration: 60, concurrency: 10 },
      timeoutMs: 30000
    },
    frontend: {
      enabled: false,
      priority: 'low',
      components: [],
      accessibilityAudit: true,
      performanceMetrics: true,
      browserCompat: ['chrome', 'firefox', 'safari'],
      responsiveDesign: true
    }
  },
  
  // SECTION 3: TESTING CONFIGURATION
  testing: {
    coverage: {
      minimumTarget: 80, // percent
      criticalPaths: {
        authentication: true,
        dataManipulation: true,
        paymentProcessing: true,
        userRegistration: true,
        adminOperations: true
      },
      testSuites: {
        databaseInjection: true,
        routingValidation: true,
        visitorJourney: true,
        userJourney: true,
        adminJourney: true,
        apiEndpoints: false,
        performanceTests: false,
        loadTests: false
      },
      edgeCases: true
    },
    retry: {
      maxAttempts: 3, // Per RETRY_FLOWS_COMPLETE.md
      stuckDetection: true, // Exit if score unchanged
      declineDetection: true, // Exit if score regressing
      autoEscalateClinic: true,
      strategy: 'balanced', // aggressive | balanced | conservative
      earlyExit: true
    },
    health: {
      // Per MATHEMATICAL_FRAMEWORK.md - weights must sum to 1.0
      weights: {
        testCoverage: 0.25,
        testSuccessRate: 0.20,
        auditScore: 0.30,
        securityCoverage: 0.15,
        criticalErrors: 0.10
      },
      thresholds: {
        excellent: 95,
        good: 85,
        fair: 70, // Clinic admission threshold
        poor: 50,
        critical: 30,
        failing: 0
      }
    },
    loopPrevention: {
      maxHealingCycles: 2, // Per CLINIC_COMPLETE.md
      stuckSensitivity: 'high', // low | medium | high
      cooldownSeconds: 2,
      abortConditions: ['stuck', 'decline', 'maxAttempts']
    }
  },
  
  // SECTION 4: ANALYSIS SETTINGS
  analysis: {
    scan: {
      depth: 'deep', // quick | standard | deep
      components: {
        holistic: true,
        rootCause: true,
        security: true,
        performance: true,
        quality: true,
        duplicates: true,
        aiCodeReview: false
      },
      fileExclusions: ['node_modules', 'dist', 'build', '.git', 'vendor'],
      maxFiles: 10000,
      cachePreviousScans: true
    },
    rootCause: {
      traceDepth: 5, // levels
      issueGrouping: true,
      priorities: {
        critical: true,
        high: true,
        medium: true,
        low: false
      },
      cascadingFailureDetection: true,
      impactAnalysisDepth: 'medium' // low | medium | high
    },
    mockDetection: {
      // Per MOCK_DETECTION_PROTOCOL.md
      enabled: true,
      thresholds: {
        real: 80,
        partial: 50,
        mostlyMock: 20,
        completeMock: 0
      },
      sensitivity: 0.5, // 0-1, lenient to strict
      penalties: {
        noScans: -30,
        emptyProject: -20,
        noCodeFiles: -15,
        perfectSecurity: -10
      },
      failOnMock: false,
      showBadges: true
    },
    security: {
      depth: 'comprehensive', // quick | standard | comprehensive
      checks: {
        sqlInjection: true,
        xss: true,
        csrf: true,
        authFlaws: true,
        hardcodedCredentials: true,
        insecureUploads: true,
        exposedData: true,
        owaspTop10: false
      },
      failureThreshold: 5, // high-risk issues
      sensitiveFilePatterns: ['.env', 'config.php', 'credentials.json', '*.key']
    },
    performance: {
      nPlusOneQueries: true,
      missingIndexes: true,
      memoryLeaks: true,
      bundleSize: true,
      slowEndpoints: true
    }
  },
  
  // SECTION 5: LLM CONFIGURATION
  llm: {
    primary: 'gpt-4o', // gpt-4o | gemini | claude | mock
    apiKey: '',
    fallback: 'gemini',
    
    // Per MULTI_LLM_PLAN.md - Specialized assignments
    agents: {
      scout94: 'gpt-4o',
      auditor: 'gemini',
      doctor: 'claude-3.5-sonnet',
      nurse: 'claude-3.5-sonnet',
      riskAssessor: 'gpt-4o-mini',
      screenshot: 'gpt-4o-vision'
    },
    
    parameters: {
      temperature: 0.3, // 0-1
      maxTokens: 2048,
      topP: 0.9, // 0-1
      timeout: 60, // seconds
      retryAttempts: 3
    },
    
    costManagement: {
      monthlyBudget: 10.00, // USD
      alertThreshold: 0.8, // 80% of budget
      trackUsage: true,
      perAgentBreakdown: true
    }
  },
  
  // SECTION 6: REPORTING CONFIGURATION
  reporting: {
    format: {
      markdown: true,
      json: true,
      html: false,
      pdf: false
    },
    components: {
      executiveSummary: true,
      healthScore: true,
      testResults: true,
      rootCauseAnalysis: true,
      securityFindings: true,
      performanceRecommendations: true,
      codeQuality: true,
      authenticityVerification: true,
      fullTestOutput: false
    },
    location: 'test-reports', // relative to project
    namingConvention: 'descriptive', // timestamped | descriptive | simple
    
    // Per PROGRESSIVE_REPORT_FLOW.md
    collaborative: {
      liveUpdates: true,
      regions: {
        scout94: true,
        clinic: true,
        auditor: true
      },
      secretaryScripts: {
        scout94: true,
        clinic: true,
        auditor: true
      },
      updateFrequency: 'realtime',
      lockTimeout: 60, // seconds
      showRegionMarkers: false,
      autoOpenIDE: true
    },
    
    summary: {
      length: 'adaptive', // adaptive | concise | detailed
      components: {
        status: true,
        metrics: true,
        issues: true,
        recommendations: true,
        timeEstimates: false
      },
      tone: 'balanced' // technical | balanced | executive
    }
  },
  
  // SECTION 7: SECURITY & PRIVACY
  security: {
    scanning: {
      depth: 'comprehensive',
      vulnerabilityChecks: {
        sql: true,
        xss: true,
        csrf: true,
        auth: true,
        hardcodedCreds: true,
        uploads: true,
        exposedData: true
      },
      failureThreshold: 5
    },
    
    privacy: {
      dataToLLM: {
        metadata: true,
        errors: true,
        codeSnippets: true,
        fullFiles: false,
        credentials: false,
        apiKeys: false,
        userData: false
      },
      storage: {
        knowledgeBase: '.scout94_knowledge.json',
        cache: '.scout94_cache/',
        logs: '.scout94.log'
      },
      retention: {
        reportsDays: 30,
        logsDays: 7,
        cacheHours: 24
      }
    },
    
    // Per MATHEMATICAL_FRAMEWORK.md - weights must sum to 1.0
    risk: {
      weights: {
        systemCommands: 0.30,
        fileOperations: 0.25,
        databaseAccess: 0.20,
        externalCalls: 0.15,
        codeComplexity: 0.10
      },
      thresholds: {
        low: 30,
        medium: 50,
        high: 75, // Auto-reject above this
        critical: 100
      },
      sandbox: true
    }
  },
  
  // SECTION 8: UI/UX CUSTOMIZATION
  ui: {
    theme: 'dark', // dark | light | auto
    accentColor: '#3b82f6',
    fontSize: 'medium', // small | medium | large
    compactMode: false,
    animations: true,
    
    chat: {
      bubbleStyle: 'rounded', // rounded | square | minimal
      markdownRendering: true,
      syntaxTheme: 'vscDarkPlus',
      codeBlockMaxHeight: 400,
      imagePreviewSize: 'medium', // small | medium | large
      autoScroll: true
    },
    
    ide: {
      lineNumbers: true,
      syntaxTheme: 'vscDarkPlus',
      wordWrap: true,
      breadcrumbs: true,
      fileTreeDepth: 5,
      filterMinified: true
    },
    
    notifications: {
      desktop: true,
      sound: false,
      position: 'top-right', // top-left | top-right | bottom-left | bottom-right
      autoDismiss: 5000, // ms
      typeFilter: ['all'] // all | errors | warnings | success
    }
  },
  
  // SECTION 9: STORAGE & DATA
  storage: {
    knowledge: {
      enabled: true,
      location: '.scout94_knowledge.json',
      maxEntries: 1000,
      autoPrune: true,
      learningRate: 1.0
    },
    
    cache: {
      location: '.scout94_cache/',
      maxSizeMB: 500,
      expiryHours: 24,
      autoClearOnStartup: false
    },
    
    logs: {
      level: 'info', // debug | info | warning | error
      location: '.scout94.log',
      maxSizeMB: 50,
      rotation: 'daily' // daily | weekly | size
    },
    
    backups: {
      autoBackup: true,
      location: '.scout94_backups/',
      maxCount: 10
    }
  },
  
  // SECTION 10: COMMUNICATION & ORCHESTRATION
  communication: {
    // Per COMMUNICATION_FLOW.md
    knowledge: {
      persistentLearning: true,
      knowledgeFile: '.scout94_knowledge.json',
      maxEntries: 1000,
      autoPrune: 100, // prune after X runs
      features: {
        recordPatterns: true,
        trackIssues: true,
        storeFixHistory: true,
        buildProjectMap: true,
        generateInsights: true
      },
      messageBoard: {
        enabled: true,
        maxMessages: 1000,
        priorityHandling: true
      },
      projectMapping: {
        autoMapFirstRun: true,
        cacheHours: 24,
        discoveryDepth: 10
      }
    },
    
    websocket: {
      port: 8080,
      autoStart: true,
      timeout: 30, // seconds
      reconnectAttempts: 10,
      pingInterval: 30, // seconds
      maxClients: 100,
      cors: '*',
      ssl: false
    },
    
    // Per CLI_GUIDE.md
    cli: {
      enabled: true,
      binaryPath: '/usr/local/bin/scout94',
      backgroundExecution: true,
      pidFile: '.scout94.pid',
      stateFile: '.scout94.state',
      defaultMode: 'audit',
      autoGenerateLogs: true,
      logLocation: '.scout94.log',
      processManagement: {
        allowPauseResume: true,
        allowRestart: true,
        statusMonitoring: true,
        remoteSSH: true
      }
    },
    
    // Per decision-framework.js
    accountability: {
      enabled: true,
      validationRules: {
        preventDeletionWithoutReplacement: true,
        detectSymptomFixes: true,
        blockLazyShortcuts: true,
        validateUserRequirements: true,
        ensureLibraryRespect: true
      },
      framework: {
        understandPhase: true,
        rootCausePhase: true,
        userIntentValidation: true,
        implementWithVerification: true
      },
      strictness: 0.7, // 0-1
      logFailures: true,
      blockInvalid: true
    }
  },
  
  // SECTION 11: ADVANCED SETTINGS
  advanced: {
    experimental: {
      betaFeatures: false,
      autoUpdateChannel: 'stable', // stable | beta | nightly
      debugMode: false,
      telemetry: false
    },
    
    cicd: {
      enabled: false,
      githubActions: {
        autoRunOnPush: false,
        autoRunOnPR: false,
        blockMergeOnFailure: false,
        uploadArtifacts: false
      },
      notifications: {
        slack: false,
        email: false,
        discord: false
      },
      reportStrategy: 'always', // failure | always | schedule
      deploymentGates: {
        minimumScore: 7,
        requiredHealth: 70,
        maxCriticalIssues: 0
      }
    },
    
    duplicateDetection: {
      enabled: true,
      similarityThreshold: 80, // percent
      analysisScope: 'wholeProject', // wholeProject | changedFiles
      autoMergeStrategy: 'never', // never | ask | smart
      preserveBoth: true,
      reportDuplicates: true
    },
    
    presets: {
      current: 'balanced',
      available: ['fast', 'balanced', 'thorough', 'costConscious', 'securityFirst', 'performance']
    },
    
    developer: {
      apiEndpointOverride: '',
      websocketPort: 8080,
      phpBinaryPath: '/usr/bin/php',
      nodejsPath: '/usr/local/bin/node',
      debugConsole: false
    }
  }
};

// Export validation helpers
export const requiredSections = [
  'version', 'general', 'agents', 'testing', 'analysis',
  'llm', 'reporting', 'security', 'ui', 'storage',
  'communication', 'advanced'
];

export const weightValidation = {
  'testing.health.weights': 1.0,
  'security.risk.weights': 1.0
};
