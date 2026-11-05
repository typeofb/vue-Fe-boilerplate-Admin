import permission from './permission';
import clickOutside from './click-outside';
import focus from './focus';
import {maxLength, numberOnly} from './input-filter';

/**
 * 전역 디렉티브 등록
 *  v-permission / v-click-outside / v-focus / v-number-only / v-max-length
 */
export default {
    install(app) {
        app.directive('permission', permission);
        app.directive('click-outside', clickOutside);
        app.directive('focus', focus);
        app.directive('number-only', numberOnly);
        app.directive('max-length', maxLength);
    },
};
