import { Router } from '@vaadin/router';
import { routes } from './routes';
import { appStore } from './stores/app-store';
import {configureLocalization} from '@lit/localize';

export const router = new Router(document.querySelector('#outlet'));

router.setRoutes(routes);

window.addEventListener('vaadin-router-location-changed', (e) => {
  appStore.setLocation((e as CustomEvent).detail.location);
  const title = appStore.currentViewTitle;
  if (title) {
    document.title = title + ' | ' + appStore.applicationName;
  } else {
    document.title = appStore.applicationName;
  }
});

export const {getLocale, setLocale} = configureLocalization({
  sourceLocale: 'en',
  targetLocales: ['de'],
  loadLocale: (locale: string) => import(`../frontend/locales/${locale}.ts`),
});

(async () => {
  await setLocale('de');
})();
