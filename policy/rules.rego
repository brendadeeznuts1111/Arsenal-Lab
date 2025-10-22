package gate.admission

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# Deny unsigned patches
deny contains msg if {
    input.request.kind.kind == "Patch"
    not has_valid_signature(input.request.object)
    msg := "Patch must be signed with cosign"
}

# Deny patches with critical violations
deny contains msg if {
    input.request.kind.kind == "Patch"
    has_critical_violations(input.request.object)
    msg := "Patch has critical invariant violations"
}

# Deny patches without validation enabled
deny contains msg if {
    input.request.kind.kind == "Patch"
    not input.request.object.spec.validation.enabled
    msg := "Patch validation must be enabled"
}

# Warn about canary patches without monitoring
warn contains msg if {
    input.request.kind.kind == "Patch"
    input.request.object.spec.stage == "canary"
    not input.request.object.spec.monitoring.enabled
    msg := "Canary patches should have monitoring enabled"
}

# Allow patches that pass all checks
allow if {
    input.request.kind.kind == "Patch"
    has_valid_signature(input.request.object)
    not has_critical_violations(input.request.object)
    input.request.object.spec.validation.enabled
}

# Helper functions
has_valid_signature(patch) if {
    patch.status.validationResult.signatureVerified == true
}

has_critical_violations(patch) if {
    some violation in patch.status.validationResult.violations
    violation.severity == "critical"
}

# Additional security policies
deny contains msg if {
    input.request.kind.kind == "Patch"
    is_security_package(input.request.object.spec.package)
    not has_security_validation(input.request.object)
    msg := "Security packages require enhanced validation"
}

# Helper: Check if package is security-related
is_security_package(package) if {
    security_keywords := ["crypto", "auth", "jwt", "hash", "security", "tls", "ssl"]
    some keyword in security_keywords
    contains(package, keyword)
}

# Helper: Check if patch has security validation
has_security_validation(patch) if {
    patch.spec.validation.retries > 3
    patch.spec.monitoring.errorThreshold < 1.0
}
