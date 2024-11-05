import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainDashboardComponent } from './main-dashboard/main-dashboard.component';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
import { UsefullLinksComponent } from './usefull-links/usefull-links.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { LogActivityComponent } from './log-activity/log-activity.component';
import { AddCodeSnippetsComponent } from './add-code-snippets/add-code-snippets.component';
import { AddUsefulLinksComponent } from './add-useful-links/add-useful-links.component';
import { ProfileComponent } from './profile/profile.component';
import { GOcrComponent } from './g-ocr/g-ocr.component';
import { GOcrBankComponent } from './g-ocr-bank/g-ocr-bank.component';
import { OcrBankPyComponent } from './ocr-bank-py/ocr-bank-py.component';
import { authGuard } from './auth.guard';
import { OcrBcaResultComponent } from './ocr-bca-result/ocr-bca-result.component';
import { OcrBriResultComponent } from './ocr-bri-result/ocr-bri-result.component';
import { OcrPermataResultComponent } from './ocr-permata-result/ocr-permata-result.component';
import { OcrDanamonResultComponent } from './ocr-danamon-result/ocr-danamon-result.component';
import { OcrBniResultComponent } from './ocr-bni-result/ocr-bni-result.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: MainDashboardComponent,
    title: 'Main Menu',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: LogActivityComponent,
      },
      {
        path: 'code-snippets',
        component: CodeSnippetsComponent,
        title: 'Code Snippets',
      },
      {
        path: 'usefull-links',
        component: UsefullLinksComponent,
        title: 'Usefull Links',
      },
      {
        path: 'add-code-snippets',
        component: AddCodeSnippetsComponent,
        title: 'Add Code Snippets',
      },
      {
        path: 'add-useful-links',
        component: AddUsefulLinksComponent,
        title: 'Add Useful Link',
      },
      {
        path: 'edit-useful-links/:id',
        component: AddUsefulLinksComponent,
        title: 'Edit Useful Link',
      },
      {
        path: 'usefull-links/:keywords',
        component: UsefullLinksComponent,
        title: 'Usefull Links',
      },
      {
        path: 'code-snippets/:keywords',
        component: CodeSnippetsComponent,
        title: 'Code Snippets',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile',
      },
      {
        path: 'g-ocr',
        component: GOcrComponent,
        title: 'G-OCR',
      },
      {
        path: 'g-ocr-bank',
        component: GOcrBankComponent,
        title: 'G-OCR Bank',
      },
      {
        path: 'ocr-bank-py',
        component: OcrBankPyComponent,
        title: 'OCR Bank Python',
      },
      {
        path: 'ocr-bca-result',
        component: OcrBcaResultComponent,
        title: 'OCR BCA Result',
      },
      {
        path: 'ocr-bri-result',
        component: OcrBriResultComponent,
        title: 'OCR BRI Result',
      },
      {
        path: 'ocr-permata-result',
        component: OcrPermataResultComponent,
        title: 'OCR Permata Result',
      },
      {
        path: 'ocr-danamon-result',
        component: OcrDanamonResultComponent,
        title: 'OCR Danamon Result',
      },
      {
        path: 'ocr-bni-result',
        component: OcrBniResultComponent,
        title: 'OCR BNI Result',
      },
    ],
  },
  {
    path: 'create-account',
    component: CreateAccountComponent,
    title: 'Create Account',
  },
];
