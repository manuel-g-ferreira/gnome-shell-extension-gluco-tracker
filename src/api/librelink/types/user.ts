/**
 * A user object from the  Librelink Up API.
 */
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: Date;
    country: string;
    uiLanguage: string;
    communicationLanguage: string;
    accountType: string;
    created: Date;
    lastLogin: Date;
    uom: string;
    dateFormat: string;
    timeFormat: string;
    emailDay: number[];
    system: System;
    details: Record<string, unknown>;
    programs: Record<string, unknown>;
    practices: Record<string, Practice>;
    devices: Record<string, Device>;
    consents: Consents;
}

export interface AuthTicket {
    token: string;
    expires: number;
    duration: number;
}

export interface DataMessages {
    unread: number;
}

export interface Notifications {
    unresolved: number;
}

interface Consents {
    llu?: Llu;
    realWorldEvidence: RealWorldEvidence;
}

interface Llu {
    policyAccept: number;
    touAccept: number;
}

interface RealWorldEvidence {
    policyAccept: number;
    touAccept: number;
    history: {policyAccept: number; declined?: boolean}[];
}

interface System {
    messages: SystemMessages;
}

interface SystemMessages {
    appReviewBanner: number;
    firstUsePhoenix: number;
    firstUsePhoenixReportsDataMerged: number;
    lluGettingStartedBanner: number;
    lluNewFeatureModal: number;
    lluOnboarding?: number;
    lvWebPostRelease: string;
    streamingTourMandatory: number;
}

interface Practice {
    id: string;
    practiceId: string;
    name: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    phoneNumber: string;
    records: null;
}

export interface Device {
    id: string;
    nickname: string;
    sn: string;
    type: number;
    uploadDate: number;
}

export interface AlarmRules {
    c: boolean;
    h: H;
    f: F;
    l: F;
    nd: Nd;
    p: number;
    r: number;
    std: Std;
}

export interface F {
    th: number;
    thmm: number;
    d: number;
    tl: number;
    tlmm: number;
    on?: boolean;
}

export interface H {
    on: boolean;
    th: number;
    thmm: number;
    d: number;
    f: number;
}

export interface Nd {
    i: number;
    r: number;
    l: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Std {}

/**
 * A sensor associated with a device.
 */
export interface Sensor {
    deviceId: string;
    sn: string;
    a: number;
    w: number;
    pt: number;
}
