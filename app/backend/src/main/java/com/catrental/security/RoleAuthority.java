package com.catrental.security;

public final class RoleAuthority {

    private RoleAuthority() {
    }

    /** e.g. "Site Manager" -> "ROLE_SITE_MANAGER" */
    public static String fromRoleName(String roleName) {
        return "ROLE_" + roleName.trim().toUpperCase().replaceAll("\\s+", "_");
    }
}
