import "./App.css";
import logo from "./img/WD.svg";
const HeaderItem = ({ children = "ГЛАВНАЯ", url = "#" }) => (
    <li class="header-item">
        <a href={url}>{children}</a>
    </li>
);

const SkillThis = ({ title = "Adobe Photoshop" }) => (
    <div class="skill-this">
        <span class="skill-label">{title}</span>
        <div class="skill-loader">
            <div class="skill-load" style={{ width: "75%" }}></div>
        </div>
    </div>
);

const SkillsBox = () => (
    <div class="skill-box">
        <SkillThis />
        <SkillThis />
        <SkillThis />
    </div>
);

const SectionSkills = () => (
    <section class="section-skill">
        <div class="container">
            <div class="skill-row">
                <div class="skill-col skill-descr">
                    <header class="section-header">
                        <h2 class="title">Мои навыки</h2>
                    </header>
                    <SkillsBox />
                </div>
                <div class="skill-col skill-img"></div>
            </div>
        </div>
    </section>
);

const Buttom = ({ children = "НАПИСАТЬ МНЕ", url = "#" }) => (
    <a href="{url}" class="btn">
        {children}
    </a>
);

const Header = () => (
    <header class="header">
        <div class="container header-container">
            <div class="header-block">
                <div class="header-flex">
                    <div class="img-block">
                        <a href="#">
                            <img src={logo} class="wd-logo" alt="WD logo" />
                        </a>
                    </div>
                    <div class="nav">
                        <input
                            type="checkbox"
                            id="burger"
                            class="burger-checkbox"
                        />
                        <label for="burger" class="burger">
                            <span></span>
                        </label>
                        <ul class="header-list">
                            <HeaderItem>ГЛАВНАЯ</HeaderItem>
                            <HeaderItem>ОБ АВТОРЕ</HeaderItem>
                            <HeaderItem>РАБОТЫ</HeaderItem>
                            <HeaderItem>ПРОЦЕСЫ</HeaderItem>
                            <HeaderItem>КОНТАНТЫ</HeaderItem>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const SectionBanner = ({ title = "Дизайн и верстка" }) => (
    <section class="section-banner">
        <div class="container">
            <div class="banner-wrap">
                <div class="col col--img">
                    <img
                        src="./img/img-01.png"
                        class="img-compuhter"
                        alt="image description"
                    />
                </div>
                <div class="col col--description">
                    <header class="section-header">
                        <h1 class="title">{title}</h1>
                    </header>
                    <div class="holder">
                        <p>
                            Lorem Ipsum - это текст-"рыба", часто используемый в
                            печати и вэб-дизайне. Lorem Ipsum является
                            стандартной "рыбой" для текстов на латинице с начала
                            XVI века.
                        </p>
                    </div>
                    <Buttom />
                </div>
            </div>
        </div>
    </section>
);

const AboutMe = ({ children = "Обо мне" }) => (
    <section class="about-me">
        <div class="container">
            <div class="about-me-h2">
                <h2>{children}</h2>
            </div>
            <div class="about-me-lorem">
                <LoremP />
            </div>
        </div>
    </section>
);

const ProjectImg = () => (
    <div class="project-img">
        <img src="img/project.svg" alt="Pencil, triangle and piece of paper" />
    </div>
);

const ProjectText = () => (
    <div class="ptoject-text">
        <h3>40+</h3>
        <p>проектов</p>
    </div>
);

const ProjectBlock = ({ children }) => (
    <div class="project">
        <ProjectImg />
        <ProjectText />
    </div>
);

const ManyProject = () => (
    <section class="many-projects">
        <div class="container">
            <div class="project-container">
                <ProjectBlock />
                <ProjectBlock />
                <ProjectBlock />
                <ProjectBlock />
                <ProjectBlock />
                <ProjectBlock />
            </div>
        </div>
    </section>
);

const ButtomCenter = () => (
    <div class="buttom-center">
        <img src="img/video.svg" class="fake-video" alt="fake video" />
        <a href="{url}">
            <img
                src="img/play-button.svg"
                class="play-button"
                alt="play buttom"
            />
        </a>
    </div>
);

const LoremP = () => (
    <p class="about-me-lorem lorem-p">
        Lorem Ipsum - это текст-"рыба", часто используемый в печати и
        вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на
        латинице с начала XVI века.
    </p>
);

const DeceptiveVideo = ({ title = "Как я работаю", url = "#" }) => (
    <section class="deceptive-video">
        <div class="container">
            <div class="video-block">
                <h2>{title}</h2>
                <LoremP />
                <div class="fake-video-block"></div>
                <ButtomCenter />
            </div>
        </div>
    </section>
);

const Row = ({ url = "#" }) => (
    <div class="row">
        <a href={url} class="col col-4"></a>
        <a href={url} class="col col-3"></a>
        <a href={url} class="col col-4 col-order1"></a>
        <a href={url} class="col col-3 col-order2"></a>
        <a href={url} class="col col-3 col-order3"></a>
        <a href={url} class="col col-4 col-order4"></a>
        <a href={url} class="col col-3"></a>
        <a href={url} class="col col-4"></a>
    </div>
);

const SectionGallery = () => (
    <section class="section-gellary">
        <Row />
    </section>
);

const ColMicrosoft = ({ url = "#" }) => (
    <div class="col-microsoft">
        <a href={url}>
            <img src="img/microsoft.png" width="255" alt="microsoft logo" />
        </a>
    </div>
);

const MicrosoftBox = () => (
    <div class="microsoft-flex-block">
        <ColMicrosoft />
        <ColMicrosoft />
        <ColMicrosoft />
        <ColMicrosoft />
    </div>
);

const Microsoft = () => (
    <section class="microsoft">
        <div class="container">
            <MicrosoftBox />
        </div>
    </section>
);

const Textarea = () => (
    <form action="">
        <textarea
            name="Message"
            class="message-form"
            cols="35"
            rows="15"
            placeholder="Сообщение"
        ></textarea>
    </form>
);

const InputBlock = ({ title = "Хотите веб-сайт?" }) => (
    <div class="input-block">
        <h2>{title}</h2>
        <LoremP />
        <form class="form-block-name-email">
            <input type="text" class="input-name" placeholder="Ваше имя" />
            <input type="email" class="input-email" placeholder="Ваш e-mail" />
        </form>
        <Textarea />
        <Buttom>ОТПРАВИТЬ</Buttom>
    </div>
);

const FormSection = () => (
    <section class="form-section">
        <div class="container">
            <InputBlock />
        </div>
    </section>
);

const Info = ({ title = "Иванов Иван" }) => (
    <div class="info">
        <h3>{title}</h3>
        <p>(с) 2018. Все права защищены.</p>
    </div>
);

const VKLink = ({ url = "#" }) => (
    <a href="{url}">
        <img src="img/vk.svg" class="vk-logo" alt="VK logo" />
    </a>
);

const VKImage = ({ children }) => (
    <div class="vk-img">
        <VKLink />
        <VKLink />
        <VKLink />
    </div>
);

const FooterBlock = () => (
    <div class="footer-block">
        <Info />
        <VKImage />
    </div>
);

const Footer = () => (
    <footer class="footer">
        <div class="container">
            <FooterBlock />
        </div>
    </footer>
);

const Main = () => (
    <main class="main">
        <SectionBanner />
        <AboutMe />
        <ManyProject />
        <SectionSkills />
        <DeceptiveVideo />
        <SectionGallery />
        <Microsoft />
        <FormSection />
    </main>
);

const Wrapper = () => (
    <div class="wrapper">
        <Header />
        <Main />
        <Footer />
    </div>
);

function App() {
    return <Wrapper />;
}

export default App;
