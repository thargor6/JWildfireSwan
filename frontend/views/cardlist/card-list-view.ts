import '@polymer/iron-icon';
import '@vaadin/grid/all-imports';
import '@vaadin/horizontal-layout';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/vaadin-icons';
import '@vaadin/vertical-layout';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { View } from '../../views/view';

interface Card {
  img: string;
  name: string;
  date: string;
  post: string;
  likes: string;
  comments: string;
  shares: string;
}

@customElement('card-list-view')
export class CardListView extends View {
  @property({ type: Array })
  items: Card[] = [];

  render() {
    return html`
      <vaadin-grid id="grid" theme="no-border no-row-borders" .items=${this.items}>
        <vaadin-grid-column>
          <template>
            <vaadin-horizontal-layout theme="spacing-s" class="card">
              <img src="[[item.img]]" />
              <vaadin-vertical-layout>
                <vaadin-horizontal-layout theme="spacing-s" class="header">
                  <span class="name">[[item.name]]</span>
                  <span class="date">[[item.date]]</span>
                </vaadin-horizontal-layout>
                <span class="post">[[item.post]]</span>
                <vaadin-horizontal-layout theme="spacing-s" class="actions">
                  <iron-icon class="icon" icon="vaadin:heart"></iron-icon>
                  <span class="likes">[[item.likes]]</span>
                  <iron-icon class="icon" icon="vaadin:comment"></iron-icon>
                  <span class="comments">[[item.comments]]</span>
                  <iron-icon class="icon" icon="vaadin:connect"></iron-icon>
                  <span class="shares">[[item.shares]]</span>
                </vaadin-horizontal-layout>
              </vaadin-vertical-layout>
            </vaadin-horizontal-layout>
          </template>
        </vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.items = [
      {
        img: 'https://randomuser.me/api/portraits/men/42.jpg',
        name: 'John Smith',
        date: 'May 8',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/women/42.jpg',
        name: 'Abagail Libbie',
        date: 'May 3',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/men/24.jpg',
        name: 'Alberto Raya',
        date: 'May 3',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/women/24.jpg',
        name: 'Emmy Elsner',
        date: 'Apr 22',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/men/76.jpg',
        name: 'Alf Huncoot',
        date: 'Apr 21',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/women/76.jpg',
        name: 'Lidmila Vilensky',
        date: 'Apr 17',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/men/94.jpg',
        name: 'Jarrett Cawsey',
        date: 'Apr 17',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/women/94.jpg',
        name: 'Tania Perfilyeva',
        date: 'Mar 8',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/men/16.jpg',
        name: 'Ivan Polo',
        date: 'Mar 5',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/women/16.jpg',
        name: 'Emelda Scandroot',
        date: 'Mar 5',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/men/67.jpg',
        name: 'Marcos Sá',
        date: 'Mar 4',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
      {
        img: 'https://randomuser.me/api/portraits/women/67.jpg',
        name: 'Jacqueline Asong',
        date: 'Mar 2',
        post: 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document without relying on meaningful content (also called greeking).',
        likes: '1K',
        comments: '500',
        shares: '20',
      },
    ];
  }
}
