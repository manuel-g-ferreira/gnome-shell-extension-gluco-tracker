export interface GlucoAPI {
    login(email: string, password: string): Promise<void>;
}
