export interface Login {
    username: string;
    password: string;
}

export interface LoginTempToken {
    userId: number;
    organizations: Array<{
        id: number;
        name: string;
        isActive: boolean;
        code: number;
    }>;
    accessToken: string;
}

export interface OrganizationInfo {
    code: number;
    id: number;
    isActive: boolean;
    name: string;
}

export interface NewUser {
    userId: number;
    firstname: string;
    lastname: string;
    status: string;
    organization: {
        id: number;
        code: number;
        name: string;
    };
    role: string;
    iat: number;
    exp: number;
}

// prev implementation

export interface ChangePassword {
    newPassword: string;
    confirmNewPassword: string;
}

export interface LoginResponse {
    accessToken: string;
}

export interface User {
    role: string;
    userId: number;
    firstname: string;
    lastname: string;
    status: Status;
    exp: number;
    iat: number;
    userRoles: Array<UserRole>;
    services: string;
}

export enum Status {
    unauthorized = 'Unauthorized',
    active = 'Active',
    inactive = 'Inactive',
    blocked = 'Blocked',
}

export interface UserRole {
    organizationId: number;
    organizationCode: number;
    personnelCode: string;
    units: Array<number>;
    roles: Array<number>;
}

export interface Organization {
    name: string;
    dbHost: string;
    dbPort: string;
    dbUsername: string;
    dbPassword: string;
    dbName: string;
    logo: string;
    id: number;
    code: number;
}

export interface Units {
    id: number;
    name: string;
    parent: number;
    organization: number;
    deletedAt: string;
    children: Array<Units>;
    mapping: Array<any>;
}

export interface UserId {
    userId: number;
}

export interface ForgetPassword extends UserId {
    otp: string;
    newPassword: string;
    confirmNewPassword: string;
}
