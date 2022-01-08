import '@vaadin/button';
import '@vaadin/combo-box';
import type { ComboBox } from '@vaadin/combo-box/vaadin-combo-box';
import '@vaadin/custom-field';
import '@vaadin/date-picker';
import '@vaadin/email-field';
import { Binder, field } from '@vaadin/form';
import '@vaadin/form-layout';
import { EndpointError } from '@vaadin/fusion-frontend';
import '@vaadin/horizontal-layout';
import '@vaadin/item';
import '@vaadin/notification';
import { Notification } from '@vaadin/notification';
import '@vaadin/number-field';
import '@vaadin/radio-group';
import '@vaadin/text-field';
import SamplePersonModel from 'Frontend/generated/org/jwildfire/swan/data/entity/SamplePersonModel';
import * as SamplePersonEndpoint from 'Frontend/generated/SamplePersonEndpoint';
import { html, PropertyValues } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { View } from '../view';

@customElement('person-form-view')
export class PersonFormViewElement extends View {
  @query('#countryCode')
  private countryCode!: ComboBox | null;

  private binder = new Binder(this, SamplePersonModel);

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.countryCode!.items = ['+354', '+91', '+62', '+98', '+964', '+353', '+44', '+972', '+39', '+225'];
  }

  render() {
    return html`
      <h3>Personal information</h3>
      <vaadin-form-layout style="width: 100%;">
        <vaadin-text-field label="First name" ${field(this.binder.model.firstName)}></vaadin-text-field>
        <vaadin-text-field label="Last name" ${field(this.binder.model.lastName)}></vaadin-text-field>
        <vaadin-date-picker label="Birthday" ${field(this.binder.model.dateOfBirth)}></vaadin-date-picker>
        <vaadin-custom-field label="Phone number" ${field(this.binder.model.phone)}>
          <vaadin-horizontal-layout theme="spacing">
            <vaadin-combo-box
              id="countryCode"
              style="width: 120px;"
              pattern="\\+\\d*"
              placeholder="Country"
              prevent-invalid-input
            ></vaadin-combo-box>
            <vaadin-text-field
              style="width: 120px; flex-grow: 1;"
              pattern="\\d*"
              prevent-invalid-input
            ></vaadin-text-field>
          </vaadin-horizontal-layout>
        </vaadin-custom-field>
        <vaadin-email-field label="Email address" ${field(this.binder.model.email)}"></vaadin-email-field>
        <vaadin-text-field label="Occupation" ${field(this.binder.model.occupation)}"></vaadin-text-field>
      </vaadin-form-layout>
      <vaadin-horizontal-layout class="button-layout" theme="spacing">
        <vaadin-button theme="primary" @click="${this.save}"> Save </vaadin-button>
        <vaadin-button @click="${this.clearForm}"> Cancel </vaadin-button>
      </vaadin-horizontal-layout>
    `;
  }

  private async save() {
    try {
      await this.binder.submitTo(SamplePersonEndpoint.update);
      this.clearForm();
      Notification.show('SamplePerson details stored.', { position: 'bottom-start' });
    } catch (error: any) {
      if (error instanceof EndpointError) {
        Notification.show(`Server error. ${error.message}`, { theme: 'error', position: 'bottom-start' });
      } else {
        throw error;
      }
    }
  }

  private clearForm() {
    this.binder.clear();
  }
}
