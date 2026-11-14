import { ContentPage } from "@/shared/ui";
import { Link } from "react-router";

/** `/cookies` — как у 21vek и 5 элемента: отдельно от политики ПДн, без внутренней кухни. */
export function CookiesPage() {
  return (
    <ContentPage
      eyebrow="Документы"
      title="Политика обработки файлов cookie"
      lead="Коротко о том, что сайт сохраняет в браузере, чтобы бронь и заказ работали."
    >
      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Что это</h2>
        <p>
          Файлы cookie и похожие данные — небольшие записи в браузере. Они помогают узнать, что это
          тот же гость, пока вы выбираете стол или собираете корзину.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Что используем</h2>
        <p>
          Только необходимые данные: без них нельзя удержать стол на 10 минут и оформить заказ. Рекламных
          и аналитических cookie (Яндекс.Метрика, Google Analytics, пиксели соцсетей) нет.
        </p>
      </section>

      <section className="grid max-w-[62ch] gap-3 text-cream-dim">
        <h2 className="font-display text-2xl text-cream">Как отключить</h2>
        <p>
          Записи можно удалить в настройках браузера. После этого бронь и корзина в этой вкладке могут
          сброситься — так устроены и крупные магазины: без технических cookie часть функций не работает.
        </p>
        <p>
          Персональные данные заказа и брони описаны в{" "}
          <Link to="/privacy">политике обработки персональных данных</Link>.
        </p>
      </section>
    </ContentPage>
  );
}
