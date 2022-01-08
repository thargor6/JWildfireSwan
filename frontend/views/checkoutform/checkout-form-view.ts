import '@polymer/iron-icon';
import '@vaadin/button';
import '@vaadin/checkbox';
import '@vaadin/combo-box';
import '@vaadin/email-field';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/select';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vaadin-icons';
import { html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { View } from '../../views/view';

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
];

const countries = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'American Samoa',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antarctica',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Bouvet Island',
  'Brazil',
  'British Indian Ocean Territory',
  'British Virgin Islands',
  'Brunei Darussalam',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Cape Verde',
  'Cayman Islands',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Christmas Island',
  'Cocos (Keeling) Islands',
  'Colombia',
  'Comoros',
  'Congo',
  'Cook Islands',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'East Timor',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Ethiopia',
  'Falkland Islands',
  'Faroe Islands',
  'Federated States of Micronesia',
  'Fiji',
  'Finland',
  'France',
  'French Guiana',
  'French Polynesia',
  'French Southern Territories',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Greenland',
  'Grenada',
  'Guadeloupe',
  'Guam',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Heard Island and McDonald Islands',
  'Honduras',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macau',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Martinique',
  'Mauritania',
  'Mauritius',
  'Mayotte',
  'Mexico',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'Netherlands Antilles',
  'New Caledonia',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Niue',
  'Norfolk Island',
  'North Korea',
  'Northern Mariana Islands',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Pitcairn',
  'Poland',
  'Portugal',
  'Puerto Rico',
  'Qatar',
  'Reunion',
  'Romania',
  'Russian Federation',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Georgia and the South Sandwich Islands',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'St. Helena',
  'St. Pierre and Miquelon',
  'Sudan',
  'Suriname',
  'Svalbard and Jan Mayen Islands',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syrian Arab Republic',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Togo',
  'Tokelau',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Turks and Caicos Islands',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'United States Minor Outlying Islands',
  'United States Virgin Islands',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City State',
  'Venezuela',
  'Vietnam',
  'Wallis and Futuna Islands',
  'Western Sahara',
  'Yemen',
  'Yugoslavia',
  'Zaire',
  'Zambia',
  'Zimbabwe',
];

@customElement('checkout-form-view')
export class CheckoutFormView extends View {
  @state()
  private showState = true;

  render() {
    return html`
      <main class="grid gap-xl items-start justify-center max-w-screen-md mx-auto pb-l px-l">
        <section class="flex flex-col flex-grow">
          <h2 class="mb-0 mt-xl text-3xl">Checkout</h2>
          <p class="mb-xl mt-0 text-secondary">All fields are required unless otherwise noted</p>
          <section class="flex flex-col mb-xl mt-m">
            <p class="m-0 text-s text-secondary">Checkout 1/3</p>
            <h3 class="mb-m mt-s text-2xl">Personal details</h3>
            <vaadin-text-field class="mb-s" label="Name" pattern="[\\p{L} \\-]+" required></vaadin-text-field>
            <vaadin-email-field class="mb-s" label="Email address" required></vaadin-email-field>
            <vaadin-text-field class="mb-s" label="Phone number" pattern="[\\d \\-\\+]+" required></vaadin-text-field>
            <vaadin-checkbox class="mt-s">Remember personal details for next time</vaadin-checkbox>
          </section>
          <section class="flex flex-col mb-xl mt-m">
            <p class="m-0 text-s text-secondary">Checkout 2/3</p>
            <h3 class="mb-m mt-s text-2xl">Shipping address</h3>
            <vaadin-combo-box
              class="mb-s"
              .items=${countries}
              label="Country"
              @value-changed=${this.countryChanged}
              required
            ></vaadin-combo-box>
            <vaadin-text-area
              class="mb-s"
              id="address"
              label="Street address"
              maxlength="200"
              required
            ></vaadin-text-area>
            <div class="flex flex-wrap gap-m">
              <vaadin-text-field
                class="mb-s"
                label="Postal code"
                maxlength="10"
                pattern="[\\d \\p{L}]*"
                required
              ></vaadin-text-field>
              <vaadin-text-field class="flex-grow mb-s" label="City" required></vaadin-text-field>
            </div>
            ${!this.showState
              ? nothing
              : html`
                  <vaadin-combo-box
                    allow-custom-value
                    class="mb-s"
                    id="state"
                    .items=${states}
                    label="State"
                    required
                  ></vaadin-combo-box>
                `}
            <vaadin-checkbox class="mt-s">Billing address is the same as shipping address</vaadin-checkbox>
            <vaadin-checkbox>Remember address for next time</vaadin-checkbox>
          </section>
          <section class="flex flex-col mb-xl mt-m">
            <p class="m-0 text-s text-secondary">Checkout 3/3</p>
            <h3 class="mb-m mt-s text-2xl">Payment information</h3>
            <vaadin-text-field
              class="self-stretch"
              label="Cardholder name"
              pattern="[\\p{L} \\-]+"
              required
            ></vaadin-text-field>
            <div class="flex flex-wrap gap-m">
              <vaadin-text-field
                class="flex-grow"
                label="Card number"
                pattern="[\\d ]{12,23}"
                required
              ></vaadin-text-field>
              <vaadin-text-field label="Security code" pattern="[0-9]{3,4}" required>
                <span class="" slot="helper">What is this?</span>
              </vaadin-text-field>
            </div>
            <div class="flex flex-wrap gap-m">
              <vaadin-select label="Expiration month" required>
                <template>
                  <vaadin-list-box>
                    <vaadin-item>01</vaadin-item>
                    <vaadin-item>02</vaadin-item>
                    <vaadin-item>03</vaadin-item>
                    <vaadin-item>04</vaadin-item>
                    <vaadin-item>05</vaadin-item>
                    <vaadin-item>06</vaadin-item>
                    <vaadin-item>07</vaadin-item>
                    <vaadin-item>08</vaadin-item>
                    <vaadin-item>09</vaadin-item>
                    <vaadin-item>10</vaadin-item>
                    <vaadin-item>11</vaadin-item>
                    <vaadin-item>12</vaadin-item>
                  </vaadin-list-box>
                </template>
              </vaadin-select>
              <vaadin-select label="Expiration year" required>
                <template>
                  <vaadin-list-box>
                    <vaadin-item>21</vaadin-item>
                    <vaadin-item>22</vaadin-item>
                    <vaadin-item>23</vaadin-item>
                    <vaadin-item>24</vaadin-item>
                    <vaadin-item>25</vaadin-item>
                  </vaadin-list-box>
                </template>
              </vaadin-select>
            </div>
          </section>
          <hr class="mb-xs mt-s mx-0" />
          <footer class="flex items-center justify-between my-m">
            <vaadin-button theme="tertiary-inline">Cancel order</vaadin-button>
            <vaadin-button theme="primary success">
              <iron-icon icon="vaadin:lock" slot="prefix"></iron-icon>
              Pay securely
            </vaadin-button>
          </footer>
        </section>
        <aside class="bg-contrast-5 box-border p-l rounded-l sticky">
          <header class="flex items-center justify-between mb-m">
            <h3 class="m-0">Order</h3>
            <vaadin-button theme="tertiary-inline">Edit</vaadin-button>
          </header>
          <ul class="list-none m-0 p-0 flex flex-col gap-m">
            <li class="flex justify-between">
              <div class="flex flex-col">
                <span>Vanilla cracker</span>
                <span class="text-s text-secondary">With wholemeal flour</span>
              </div>
              <span>$7.00</span>
            </li>
            <li class="flex justify-between">
              <div class="flex flex-col">
                <span>Vanilla blueberry cake</span>
                <span class="text-s text-secondary">With blueberry jam</span>
              </div>
              <span>$8.00</span>
            </li>
            <li class="flex justify-between">
              <div class="flex flex-col">
                <span>Vanilla pastry</span>
                <span class="text-s text-secondary">With wholemeal flour</span>
              </div>
              <span>$5.00</span>
            </li>
            <li class="flex justify-between">
              <div class="flex flex-col">
                <span>Blueberry cheese cake</span>
                <span class="text-s text-secondary">With blueberry jam</span>
              </div>
              <span>$7.00</span>
            </li>
          </ul>
        </aside>
      </main>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('flex', 'flex-col', 'h-full');
  }

  private countryChanged(e: CustomEvent) {
    const value = e.detail.value as string;
    this.showState = value === 'United States';
  }
}
