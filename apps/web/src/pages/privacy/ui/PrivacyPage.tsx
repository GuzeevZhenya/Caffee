import { ContentPage } from "@/shared/ui";
import { Link } from "react-router";

/** `/privacy` — политика для гостя, в духе 21vek / 5 элемента. */
export function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Документы"
      title="Политика обработки персональных данных"
      lead="Размещена, чтобы было понятно, какие сведения мы берём при брони и заказе и как ими пользуемся. Основание — Закон Республики Беларусь от 7 мая 2021 г. № 99-З «О защите персональных данных»."
    >
      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Кто обрабатывает данные</h2>
        <p>
          Оператор — кофейня Tactile Craft Coffee &amp; Bakery, Минск, ул. Кофейная, 13, тел.{" "}
          <a href="tel:+375291234567">+375 29 123-45-67</a>. Реквизиты — на странице{" "}
          <Link to="/legal">юридической информации</Link>.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Какие данные и зачем</h2>
        <p>Берём только то, без чего нельзя принять бронь или заказ:</p>
        <ul className="grid list-disc gap-2 pl-5">
          <li>имя и телефон — чтобы закрепить стол и связаться, если слот изменится;</li>
          <li>состав заказа и способ получения (в зале или с собой) — чтобы приготовить и выдать заказ.</li>
        </ul>
        <p>
          Рассылок, рекламы и счётчиков аналитики нет. Кабинет сотрудников — отдельный вход, к гостевым
          заказам он нужен только бариста и администратору.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Срок хранения</h2>
        <p>
          Данные брони и заказа храним, пока заказ не выдан или бронь не истекла, и ещё столько, сколько
          нужно для учёта и возможных обращений. Дальше удаляем.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Кому передаём</h2>
        <p>
          Третьим лицам данные не продаём и в рекламные сети не отдаём. Ими пользуются только сотрудники
          кофейни, чтобы принять бронь и собрать заказ.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Файлы cookie</h2>
        <p>
          В браузере сохраняются технические данные, без которых не работают бронь стола и корзина.
          Подробности — в{" "}
          <Link to="/cookies">политике обработки файлов cookie</Link>.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Ваши права</h2>
        <p>
          Можно запросить сведения об обработке, исправить данные или попросить их удалить — по телефону
          кофейни. Жалобу можно направить в Национальный центр защиты персональных данных (
          <a href="https://cpd.by" rel="noreferrer" target="_blank">
            cpd.by
          </a>
          ).
        </p>
      </section>
    </ContentPage>
  );
}
