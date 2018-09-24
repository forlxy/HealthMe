using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(AssignmentAgain.Startup))]
namespace AssignmentAgain
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
