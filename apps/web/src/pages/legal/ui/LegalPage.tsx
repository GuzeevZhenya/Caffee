import { ContentPage } from "@/shared/ui";
import { Link } from "react-router";

/** `/legal` — реквизиты и условия, как «Юридическая информация» у 5 элемента. */
export function LegalPage() {
  return (
    <ContentPage
      eyebrow="Документы"
      title="Юридическая информация"
      lead="Сведения о кофейне, условия брони и заказа. Политика персональных данных и cookie — отдельными страницами."
    >
      <section className="rounded-l border border-ink-500 bg-ink-800/40 p-6">
        <h2 className="font-display text-2xl text-cream">Реквизиты</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-cream-dim">Наименование</dt>
            <dd className="text-cream">Tactile Craft Coffee &amp; Bakery</dd>
          </div>
          <div>
            <dt className="text-cream-dim">Адрес</dt>
            <dd className="text-cream">Минск, ул. Кофейная, 13</dd>
          </div>
          <div>
            <dt className="text-cream-dim">Режим работы</dt>
            <dd className="text-cream">ежедневно 08:00–23:00</dd>
          </div>
          <div>
            <dt className="text-cream-dim">Телефон</dt>
            <dd>
              <a href="tel:+375291234567">+375 29 123-45-67</a>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-cream-dim">
          Обращения по заказу и брони принимаем по телефону. Полные регистрационные данные владельца
          публикуются здесь после государственной регистрации.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Заказ и бронь</h2>
        <ul className="grid list-disc gap-2 pl-5">
          <li>цены на сайте — в белорусских рублях, итоговая сумма считается при оформлении;</li>
          <li>стол удерживается на 10 минут, пока вы оформляете заказ; слот в зале — 2 часа;</li>
          <li>заказ «в кафе» доступен вместе с бронью, «с собой» — без стола, выдача у стойки;</li>
          <li>
            доставка — в зоне центра Минска, бесплатно от 30 BYN; нужна геоточка адреса.
          </li>
        </ul>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Документы</h2>
        <ul className="grid gap-2">
          <li>
            <Link to="/privacy">Политика обработки персональных данных</Link>
          </li>
          <li>
            <Link to="/cookies">Политика обработки файлов cookie</Link>
          </li>
        </ul>
      </section>
    </ContentPage>
  );
}
