import '@vaadin/button';
import '@vaadin/combo-box';
import type { ComboBox } from '@vaadin/combo-box/vaadin-combo-box';
import { Binder, field } from '@vaadin/form';
import '@vaadin/form-layout';
import { EndpointError } from '@vaadin/fusion-frontend';
import '@vaadin/horizontal-layout';
import '@vaadin/notification';
import { Notification } from '@vaadin/notification';
import '@vaadin/number-field';
import '@vaadin/text-field';
import SampleAddressModel from 'Frontend/generated/org/jwildfire/swan/data/entity/SampleAddressModel';
import * as SampleAddressEndpoint from 'Frontend/generated/SampleAddressEndpoint';
import { html, PropertyValues } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { View } from '../view';

@customElement('address-form-view')
export class AddressFormView extends View {
  @query('#state')
  private state!: ComboBox | null;
  @query('#country')
  private country!: ComboBox | null;

  private binder = new Binder(this, SampleAddressModel);

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this.state!.items = ['State 1', 'State 2', 'State 3'];
    this.country!.items = ['Country 1', 'Country 2', 'Country 3'];
  }

  render() {
    return html`
      <h3>Address</h3>
      <vaadin-form-layout>
        <vaadin-text-field colspan="2" label="Street address" ${field(this.binder.model.street)}></vaadin-text-field>
        <vaadin-number-field label="Postal code" ${field(this.binder.model.postalCode)}></vaadin-number-field>
        <vaadin-text-field label="City" ${field(this.binder.model.city)}></vaadin-text-field>
        <vaadin-combo-box id="state" label="State" ${field(this.binder.model.state)}></vaadin-combo-box>
        <vaadin-combo-box id="country" label="Country" ${field(this.binder.model.country)}></vaadin-combo-box>
      </vaadin-form-layout>
      <vaadin-horizontal-layout class="button-layout" theme="spacing">
        <vaadin-button theme="primary" @click="${this.save}"> Save </vaadin-button>
        <vaadin-button @click="${this.clearForm}">Cancel</vaadin-button>
      </vaadin-horizontal-layout>
    `;
  }

  private async save() {
    try {
      await this.binder.submitTo(SampleAddressEndpoint.update);
      this.clearForm();
      Notification.show('SampleAddress stored.', { position: 'bottom-start' });
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
