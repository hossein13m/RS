import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import jwtDecode from 'jwt-decode';
import { ChangePassword, ForgetPassword, Login, LoginResponse, LoginTempToken, NewUser, Organization, User, UserId } from './auth.model';
import { ResponseWithPagination } from '#shared/models/pagination.model';
import { UtilityFunctions } from '#shared/utilityFunctions';
import { navigation } from '../dashboard-configs/navigation';
import { FuseNavigation } from '../../@fuse/types';
import { tempAccess } from '../dashboard-configs/temp-access';

@Injectable()
export class AuthorizationService {
    constructor(private readonly http: HttpClient, private readonly router: Router) {}

    public newLogin(userInfo: Login): Observable<LoginTempToken> {
        return this.http.post<LoginTempToken>(`/api/v2/auth/login`, userInfo);
    }

    public temporaryStoreUserTokenAndInfo(userInfo: LoginTempToken): void {
        localStorage.removeItem('tempUserInfo');
        localStorage.setItem('tempUserInfo', JSON.stringify(userInfo));
    }

    public selectActiveOrganization(organizationCode: number): Observable<{ accessToken: string }> {
        const token = JSON.parse(this.getToken('tempUserInfo')).accessToken;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
        return this.http.post<{ accessToken: string }>(`/api/v2/auth/access-token`, { organizationCode }, { headers: headers });
    }

    public setAccessTokenInLocalStorage(accessToken: string): void {
        localStorage.removeItem('accessToken');
        localStorage.setItem('accessToken', accessToken);
    }

    public getToken(tokenType: 'tempUserInfo' | 'accessToken'): string {
        return localStorage.getItem(tokenType);
    }

    public verifyUserIntegration(): Promise<NewUser> {
        const token = this.getToken('accessToken');
        const headers = new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
        return this.http.post<NewUser>(`/api/v2/auth/verify`, {}, { headers: headers }).toPromise();
    }

    public static checkUserAccess(): Array<FuseNavigation> {
        const userRoles: Array<string> = [];
        const authorizedNavigation: Array<FuseNavigation> = [];
        tempAccess.split('|').map((userRole) => userRoles.push(userRole));
        navigation.map((navItem) => {
            if (userRoles.includes(navItem.id)) {
                if (!!navItem.children) {
                    authorizedNavigation.push({
                        id: navItem.id,
                        title: navItem.title,
                        icon: navItem.icon,
                        type: navItem.type,
                        children: [],
                    });
                    navItem.children.map((navChild) => {
                        userRoles.includes(navChild.id) && authorizedNavigation.find((pushedItem) => pushedItem.id === navItem.id).children.push(navChild);
                    });
                } else authorizedNavigation.push(navItem);
            }
        });

        return authorizedNavigation;
    }

    public changePassword(model: ChangePassword): Observable<null> {
        return this.http.put<null>(`/api/v2/user/unauthorized/change-password`, model);
    }

    public getOrganizations(codes: Array<number>): Observable<ResponseWithPagination<Organization>> {
        const params: HttpParams = UtilityFunctions.prepareParamsFromObjectsForAPICalls({
            limit: 1000,
            skip: 0,
            codes,
        });
        return this.http.get<ResponseWithPagination<Organization>>(`/api/v1/organization`, { params });
    }

    public decodeToken(token?: LoginResponse): User {
        return token ? ({ ...jwtDecode(token.accessToken) } as User) : ({ ...jwtDecode(localStorage.getItem('accessToken')) } as User);
    }

    public logOut(): Promise<boolean> {
        localStorage.removeItem('theme');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('activeOrganization');
        localStorage.removeItem('user');
        return this.router.navigate(['/login']);
    }

    public setUserInfoInLocalStorage(token: LoginResponse): void {
        localStorage.setItem('user', JSON.stringify(this.decodeToken(token)));
    }

    public sendOTPSms(nationalCode: string): Observable<UserId> {
        return this.http.post<UserId>('/api/v2/user/verification-password-sms', { nationalCode });
    }

    public forgetPassword(forgetPassword: ForgetPassword): Observable<void> {
        return this.http.put<void>('/api/v2/user/forget-password', forgetPassword);
    }
}
